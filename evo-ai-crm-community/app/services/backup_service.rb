class BackupService
  def initialize
    @backups_dir = Rails.root.join('storage', 'backups')
    FileUtils.mkdir_p(@backups_dir) unless File.directory?(@backups_dir)
  end

  def perform
    timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
    backup_file = @backups_dir.join("backup_#{timestamp}.tar.gz")
    tmp_dir = Dir.mktmpdir

    begin
      # 1. Dump database
      db_dump_path = File.join(tmp_dir, 'database.sql')
      dump_database(db_dump_path)

      # 2. Copy storage folder (excluding backups folder itself)
      # In Rails, ActiveStorage files are typically in storage/
      storage_src = Rails.root.join('storage').to_s
      storage_dest = File.join(tmp_dir, 'storage')
      
      # We use rsync to copy the storage directory while excluding the backups folder
      # If rsync is not available, we can use ruby's FileUtils but filtering is harder.
      # Let's just copy files explicitly or use tar directly
      
      # It's better to just tar the database.sql and the storage folder directly.
      # Create a tar command that includes the tmp database.sql and the storage folder, but excludes storage/backups
      
      tar_command = [
        'tar',
        '-czf', backup_file.to_s,
        '-C', tmp_dir, 'database.sql',
        '-C', Rails.root.to_s, 'storage',
        '--exclude=storage/backups'
      ]
      
      success = system(*tar_command)
      raise "Failed to create backup archive" unless success

      # 3. Clean up old backups
      clean_old_backups
      
      backup_file.to_s
    ensure
      FileUtils.remove_entry(tmp_dir)
    end
  end

  private

  def dump_database(destination)
    db_config = ActiveRecord::Base.connection_db_config.configuration_hash
    
    env = {
      'PGPASSWORD' => db_config[:password].to_s
    }
    
    cmd = [
      'pg_dump',
      '-h', db_config[:host].to_s,
      '-U', db_config[:username].to_s,
      '-F', 'p', # plain text sql
      '-f', destination
    ]
    
    cmd << '-p' << db_config[:port].to_s if db_config[:port]
    cmd << db_config[:database].to_s

    success = system(env, *cmd)
    raise "Failed to dump database" unless success
  end

  def clean_old_backups
    backups = Dir.glob(@backups_dir.join('backup_*.tar.gz')).sort_by { |f| File.mtime(f) }
    
    if backups.length > 5
      backups_to_delete = backups[0...(backups.length - 5)]
      backups_to_delete.each do |file|
        File.delete(file)
      end
    end
  end
end
