class ManualBackupWorker
  include Sidekiq::Worker

  sidekiq_options queue: :default, retry: 0

  def perform
    Rails.logger.info "Starting ManualBackupWorker..."
    begin
      backup_file = BackupService.new.perform
      Rails.logger.info "Manual Backup created successfully at #{backup_file}"
    rescue => e
      Rails.logger.error "Manual Backup failed: #{e.message}"
    end
  end
end
