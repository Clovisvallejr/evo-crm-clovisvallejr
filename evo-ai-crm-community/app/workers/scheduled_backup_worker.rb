class ScheduledBackupWorker
  include Sidekiq::Worker

  sidekiq_options queue: :scheduled_jobs, retry: 0

  def perform
    auto_backup_enabled = InstallationConfig.find_by(name: 'BACKUP_AUTO_ENABLED')&.value
    auto_backup_enabled = auto_backup_enabled == 'true' || auto_backup_enabled == true
    return unless auto_backup_enabled

    schedule_time_str = InstallationConfig.find_by(name: 'BACKUP_SCHEDULE_TIME')&.value || '03:00'
    
    # Configured timezone (fallback to UTC)
    app_timezone = ENV['APP_TIMEZONE'] || 'UTC'
    Time.use_zone(app_timezone) do
      now = Time.zone.now
      begin
        scheduled_time_today = Time.zone.parse(schedule_time_str)
      rescue
        scheduled_time_today = Time.zone.parse('03:00')
      end

      Rails.logger.debug "[BackupWorker] Checking: localTime=#{now.strftime('%H:%M')} | scheduledTime=#{scheduled_time_today.strftime('%H:%M')} | timezone=#{Time.zone.name}"

      time_diff_minutes = ((now - scheduled_time_today) / 60.0).floor

      # Allow a 5 minute window for execution
      if time_diff_minutes >= 0 && time_diff_minutes < 5
        redis = Redis::Namespace.new('evo', redis: Redis.new(url: ENV['REDIS_URL']))
        last_run = redis.get('last_backup_run_date')
        
        if last_run != now.to_date.to_s
          Rails.logger.info "[BackupWorker] Starting ScheduledBackupWorker for #{schedule_time_str}..."
          redis.set('last_backup_attempt', now.to_s)
          
          begin
            backup_file = BackupService.new.perform
            Rails.logger.info "[BackupWorker] Backup created successfully at #{backup_file}"
            redis.set('last_backup_run_date', now.to_date.to_s)
            redis.set('last_backup_success', now.to_s)
          rescue => e
            Rails.logger.error "[BackupWorker] Backup failed: #{e.message}"
            redis.set('last_backup_error', "#{now.to_s}: #{e.message}")
            # Do not set last_backup_run_date so it can retry in the next minute if still within the 5 min window
          end
        end
      end
    end
  end
end
