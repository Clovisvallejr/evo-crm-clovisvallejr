class Api::V1::Admin::BackupsController < Api::V1::Admin::BaseController
  def index
    backups_dir = Rails.root.join('storage', 'backups')
    
    backups = if File.directory?(backups_dir)
                Dir.glob(backups_dir.join('backup_*.tar.gz')).map do |file|
                  {
                    id: File.basename(file),
                    name: File.basename(file),
                    size: File.size(file),
                    created_at: File.mtime(file)
                  }
                end.sort_by { |b| b[:created_at] }.reverse
              else
                []
              end
              
    auto_backup_enabled = InstallationConfig.find_by(name: 'BACKUP_AUTO_ENABLED')&.value || false
    schedule_time = InstallationConfig.find_by(name: 'BACKUP_SCHEDULE_TIME')&.value || '03:00'

    render json: { 
      backups: backups,
      config: {
        auto_backup_enabled: auto_backup_enabled,
        schedule_time: schedule_time
      }
    }
  end

  def create
    ManualBackupWorker.perform_async
    render json: { message: 'Backup started' }, status: :accepted
  end

  def schedule
    enabled = params[:auto_backup_enabled]
    time = params[:schedule_time]

    if !enabled.nil?
      config = InstallationConfig.find_or_initialize_by(name: 'BACKUP_AUTO_ENABLED')
      config.value = enabled
      config.save!
    end

    if time.present?
      config = InstallationConfig.find_or_initialize_by(name: 'BACKUP_SCHEDULE_TIME')
      config.value = time
      config.save!
      
      # Try to update Sidekiq Cron if it's configured in code (or just require a restart)
      # Usually you'd update a sidekiq cron job dynamically here.
      # For now, we update the config and the schedule can read it.
    end

    render json: { message: 'Schedule updated' }
  end

  def download
    backup_id = params[:id]
    # Ensure it's just a filename to prevent path traversal
    safe_filename = File.basename(backup_id)
    file_path = Rails.root.join('storage', 'backups', safe_filename)

    if File.exist?(file_path)
      send_file file_path, filename: safe_filename, type: 'application/gzip', disposition: 'attachment'
    else
      render json: { error: 'Backup not found' }, status: :not_found
    end
  end

  def destroy
    backup_id = params[:id]
    safe_filename = File.basename(backup_id)
    file_path = Rails.root.join('storage', 'backups', safe_filename)

    if File.exist?(file_path)
      File.delete(file_path)
      render json: { message: 'Backup deleted' }
    else
      render json: { error: 'Backup not found' }, status: :not_found
    end
  end
end
