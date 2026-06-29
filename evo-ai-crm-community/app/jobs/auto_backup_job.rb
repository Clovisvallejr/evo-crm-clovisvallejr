class AutoBackupJob < ApplicationJob
  queue_as :housekeeping

  def perform
    # Check if automated backup is enabled
    return unless RuntimeConfig.get('backup_auto_enabled') == 'true'

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
      Rails.logger.error "AutoBackupJob system command error: #{e.message}"
    end

    if success && File.exist?(file_path)
      # Attempt compression
      tar_filename = "#{filename}.tar.gz"
      tar_path = File.join(backup_dir, tar_filename)
      
      compress_success = false
      begin
        compress_success = system("tar -czf #{tar_path} -C #{backup_dir} #{filename}")
      rescue => e
        Rails.logger.error "AutoBackupJob compression error: #{e.message}"
      end

      if compress_success && File.exist?(tar_path)
        FileUtils.rm(file_path)
      end
    else
      # JSON Fallback
      begin
        backup_data = {}
        ActiveRecord::Base.connection.tables.each do |table|
          next if ['schema_migrations', 'ar_internal_metadata'].include?(table)
          backup_data[table] = ActiveRecord::Base.connection.select_all("SELECT * FROM #{table}").to_a
        end
        
        json_filename = "backup-#{Time.current.strftime('%Y%m%d_%H%M%S')}.json"
        json_path = File.join(backup_dir, json_filename)
        File.write(json_path, backup_data.to_json)
        FileUtils.rm_f(file_path)
      rescue => e
        Rails.logger.error "AutoBackupJob JSON Fallback failed: #{e.message}"
      end
    end

    # Apply retention policy
    apply_retention_policy(backup_dir)
  end

  private

  def apply_retention_policy(backup_dir)
    retention = (RuntimeConfig.get('backup_retention') || '5').to_i
    files = Dir.glob(File.join(backup_dir, '*')).sort_by { |f| File.ctime(f) }

    if files.size > retention
      files_to_delete = files.first(files.size - retention)
      files_to_delete.each do |file|
        FileUtils.rm(file)
        Rails.logger.info "AutoBackupJob deleted old backup: #{File.basename(file)}"
      end
    end
  end
end
