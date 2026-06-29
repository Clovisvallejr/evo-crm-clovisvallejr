class Api::V1::BackupsController < Api::V1::BaseController
  before_action :ensure_admin!

  def index
    backup_dir = Rails.root.join('storage/backups')
    FileUtils.mkdir_p(backup_dir)

    files = Dir.glob(File.join(backup_dir, '*')).map do |file_path|
      {
        name: File.basename(file_path),
        size: File.size(file_path),
        created_at: File.ctime(file_path)
      }
    end.sort_by { |f| f[:created_at] }.reverse

    config = {
      auto_backup_enabled: RuntimeConfig.get('backup_auto_enabled') == 'true',
      backup_frequency: RuntimeConfig.get('backup_frequency') || 'daily',
      backup_retention: (RuntimeConfig.get('backup_retention') || '5').to_i
    }

    render json: { backups: files, config: config }
  end

  def create
    backup_dir = Rails.root.join('storage/backups')
    FileUtils.mkdir_p(backup_dir)
    filename = "backup-#{Time.current.strftime('%Y%m%d_%H%M%S')}.sql"
    file_path = File.join(backup_dir, filename)

    db_config = ActiveRecord::Base.connection_db_config.configuration_hash
    host = db_config[:host] || 'localhost'
    username = db_config[:username] || 'postgres'
    password = db_config[:password]
    database = db_config[:database]

    pg_env = { 'PGPASSWORD' => password.to_s }
    cmd = "pg_dump -h #{host} -U #{username} -d #{database} -F p -f #{file_path}"

    success = false
    begin
      success = system(pg_env, cmd)
    rescue => e
      Rails.logger.error "Backup system command error: #{e.message}"
    end

    if success && File.exist?(file_path)
      # Attempt compression
      tar_filename = "#{filename}.tar.gz"
      tar_path = File.join(backup_dir, tar_filename)
      
      compress_success = false
      begin
        compress_success = system("tar -czf #{tar_path} -C #{backup_dir} #{filename}")
      rescue => e
        Rails.logger.error "Backup compression error: #{e.message}"
      end

      if compress_success && File.exist?(tar_path)
        FileUtils.rm(file_path) # remove uncompressed SQL
        final_filename = tar_filename
      else
        final_filename = filename
      end

      render json: { message: 'Backup created successfully', filename: final_filename }
    else
      # JSON Fallback in case pg_dump is not available (such as on development machines)
      begin
        backup_data = {}
        ActiveRecord::Base.connection.tables.each do |table|
          next if ['schema_migrations', 'ar_internal_metadata'].include?(table)
          backup_data[table] = ActiveRecord::Base.connection.select_all("SELECT * FROM #{table}").to_a
        end
        
        json_filename = "backup-#{Time.current.strftime('%Y%m%d_%H%M%S')}.json"
        json_path = File.join(backup_dir, json_filename)
        File.write(json_path, backup_data.to_json)
        
        FileUtils.rm_f(file_path) # Clean incomplete sql if any
        render json: { message: 'Backup created successfully (JSON Fallback)', filename: json_filename }
      rescue => e
        render json: { error: "Backup failed: #{e.message}" }, status: :internal_server_error
      end
    end
  end

  def destroy
    backup_dir = Rails.root.join('storage/backups')
    file_path = File.join(backup_dir, params[:id])

    if File.exist?(file_path) && file_path.to_s.start_with?(backup_dir.to_s)
      FileUtils.rm(file_path)
      render json: { message: 'Backup deleted successfully' }
    else
      render json: { error: 'File not found' }, status: :not_found
    end
  end

  def download
    backup_dir = Rails.root.join('storage/backups')
    file_path = File.join(backup_dir, params[:filename])

    if File.exist?(file_path) && file_path.to_s.start_with?(backup_dir.to_s)
      send_file file_path, disposition: 'attachment'
    else
      render json: { error: 'File not found' }, status: :not_found
    end
  end

  def update_config
    RuntimeConfig.set('backup_auto_enabled', params[:auto_backup_enabled].to_s)
    RuntimeConfig.set('backup_frequency', params[:backup_frequency].to_s)
    RuntimeConfig.set('backup_retention', params[:backup_retention].to_s)

    render json: { message: 'Configuration updated successfully' }
  end

  def restore
    backup_dir = Rails.root.join('storage/backups')
    file_path = File.join(backup_dir, params[:id])

    unless File.exist?(file_path) && file_path.to_s.start_with?(backup_dir.to_s)
      return render json: { error: 'File not found' }, status: :not_found
    end

    # Perform restore securely in a background thread to prevent timeout
    Thread.new do
      begin
        db_config = ActiveRecord::Base.connection_db_config.configuration_hash
        host = db_config[:host] || 'localhost'
        username = db_config[:username] || 'postgres'
        password = db_config[:password]
        database = db_config[:database]

        if file_path.to_s.end_with?('.json')
          # Restore JSON backup
          json_data = JSON.parse(File.read(file_path))
          ActiveRecord::Base.transaction do
            # Disable triggers/constraints if possible or delete tables in order
            json_data.each do |table, rows|
              ActiveRecord::Base.connection.execute("TRUNCATE TABLE #{table} CASCADE") rescue nil
              next if rows.empty?
              
              columns = rows.first.keys.map { |c| "\"#{c}\"" }.join(', ')
              rows.each do |row|
                values = row.values.map { |v| ActiveRecord::Base.connection.quote(v) }.join(', ')
                ActiveRecord::Base.connection.execute("INSERT INTO #{table} (#{columns}) VALUES (#{values})")
              end
            end
          end
        else
          # Restore SQL backup
          sql_file = file_path
          if file_path.to_s.end_with?('.tar.gz')
            # Extract tar.gz first
            extracted_filename = File.basename(file_path, '.tar.gz')
            extracted_path = File.join(backup_dir, extracted_filename)
            system("tar -xzf #{file_path} -C #{backup_dir}")
            sql_file = extracted_path
          end

          pg_env = { 'PGPASSWORD' => password.to_s }
          cmd = "psql -h #{host} -U #{username} -d #{database} -f #{sql_file}"
          system(pg_env, cmd)

          # Cleanup extracted SQL if we extracted it
          FileUtils.rm(sql_file) if file_path.to_s.end_with?('.tar.gz') && File.exist?(sql_file)
        end
        Rails.logger.info "Backup restore completed successfully: #{file_path}"
      rescue => e
        Rails.logger.error "Backup restore failed: #{e.message}"
      end
    end

    render json: { message: 'Restore process started in the background' }
  end

  private

  def ensure_admin!
    unless Current.user&.administrator?
      render json: { error: 'Access denied: Administrator role required' }, status: :forbidden
    end
  end
end
