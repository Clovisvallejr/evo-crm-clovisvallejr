class ScheduledBackupWorker
  include Sidekiq::Worker

  sidekiq_options queue: :scheduled_jobs, retry: 0

  def perform
    auto_backup_enabled = InstallationConfig.find_by(name: 'BACKUP_AUTO_ENABLED')&.value
    auto_backup_enabled = auto_backup_enabled == 'true' || auto_backup_enabled == true
    return unless auto_backup_enabled

    schedule_time_str = InstallationConfig.find_by(name: 'BACKUP_SCHEDULE_TIME')&.value || '03:00'
    
    now = Time.current
    begin
      scheduled_time_today = Time.zone.parse(schedule_time_str)
    rescue
      scheduled_time_today = Time.zone.parse('03:00')
    end

    if now >= scheduled_time_today && now < (scheduled_time_today + 5.minutes)
      # Check if already ran today to prevent multiple runs if sidekiq is delayed
      last_run = Redis::Namespace.new('evo', redis: Redis.new(url: ENV['REDIS_URL'])).get('last_backup_run_date')
      
      if last_run != now.to_date.to_s
        Rails.logger.info "Starting ScheduledBackupWorker for #{schedule_time_str}..."
        begin
          backup_file = BackupService.new.perform
          Rails.logger.info "Backup created successfully at #{backup_file}"
          Redis::Namespace.new('evo', redis: Redis.new(url: ENV['REDIS_URL'])).set('last_backup_run_date', now.to_date.to_s)
        rescue => e
          Rails.logger.error "Backup failed: #{e.message}"
        end
      end
    end
  end
end
