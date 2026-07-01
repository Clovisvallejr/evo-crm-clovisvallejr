class RestoreService
  class RestoreError < StandardError; end

  def initialize(backup_filename)
    @backup_filename = backup_filename
    @backups_dir = Rails.root.join('storage', 'backups')
    @backup_path = @backups_dir.join(File.basename(@backup_filename))
    @temp_dir = Rails.root.join('tmp', "restore_#{Time.now.to_i}")
  end

  def perform
    raise RestoreError, "Backup file not found at #{@backup_path}" unless File.exist?(@backup_path)

    Rails.logger.info "Starting restore from #{@backup_filename}"
    
    begin
      prepare_temp_directory
      extract_backup
      restore_database
      restore_storage_files
      
      Rails.logger.info "Restore completed successfully"
      true
    rescue => e
      Rails.logger.error "Restore failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      raise RestoreError, "Failed to restore backup: #{e.message}"
    ensure
      cleanup
    end
  end

  private

  def prepare_temp_directory
    FileUtils.rm_rf(@temp_dir) if Dir.exist?(@temp_dir)
    FileUtils.mkdir_p(@temp_dir)
  end

  def extract_backup
    Rails.logger.info "Extracting backup to #{@temp_dir}"
    success = system("tar", "-xzf", @backup_path.to_s, "-C", @temp_dir.to_s)
    raise RestoreError, "Failed to extract backup file" unless success
  end

  def restore_database
    sql_file = @temp_dir.join('database.sql')
    raise RestoreError, "Database dump not found in backup" unless File.exist?(sql_file)

    Rails.logger.info "Restoring database from #{sql_file}"
    
    # We use psql directly inside the container since it's the most reliable way 
    # to drop the schema and recreate it, then pipe the SQL in.
    db_config = Rails.configuration.database_configuration[Rails.env]
    host = db_config['host'] || 'localhost'
    user = db_config['username']
    database = db_config['database']
    password = db_config['password']

    env = { 'PGPASSWORD' => password.to_s }

    # Drop and recreate public schema to clean slate
    drop_cmd = ["psql", "-h", host, "-U", user, "-d", database, "-c", "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"]
    
    Rails.logger.info "Cleaning database schema..."
    success = system(env, *drop_cmd)
    raise RestoreError, "Failed to clean database schema" unless success

    # Restore the database
    Rails.logger.info "Importing database..."
    restore_cmd = "psql -h #{host} -U #{user} -d #{database} < #{sql_file}"
    success = system(env, restore_cmd)
    raise RestoreError, "Failed to import database SQL" unless success
  end

  def restore_storage_files
    storage_backup_dir = @temp_dir.join('storage')
    return unless Dir.exist?(storage_backup_dir)

    Rails.logger.info "Restoring storage files..."
    
    # We copy everything from the temp storage dir to the real storage dir.
    # Exclude backups dir itself if it was accidentally backed up inside
    real_storage_dir = Rails.root.join('storage')
    
    # Use cp -a to preserve attributes if possible, or just standard ruby FileUtils
    Dir.glob(storage_backup_dir.join('*')).each do |entry|
      next if File.basename(entry) == 'backups' # skip restoring backups directory itself
      FileUtils.cp_r(entry, real_storage_dir)
    end
  end

  def cleanup
    if Dir.exist?(@temp_dir)
      Rails.logger.info "Cleaning up temporary files at #{@temp_dir}"
      FileUtils.rm_rf(@temp_dir)
    end
  end
end
