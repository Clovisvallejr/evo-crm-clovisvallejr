class Messages::AudioTranscriptionService
  include Events::Types
  pattr_initialize [:attachment!]

  STT_PROVIDERS = %w[openrouter openai local_whisper].freeze

  def perform
    Rails.logger.info "AudioTranscriptionService: Starting for attachment #{attachment.id}"

    unless attachment.audio?
      Rails.logger.warn "AudioTranscriptionService: Attachment #{attachment.id} is not audio"
      return { error: 'Attachment is not audio' }
    end

    if attachment.meta&.[]('transcribed_text').present?
      Rails.logger.info "AudioTranscriptionService: Transcription already exists for attachment #{attachment.id}"
      return { error: 'Transcription already exists' }
    end

    unless transcription_enabled?
      Rails.logger.warn "AudioTranscriptionService: Transcription not enabled"
      return { error: 'Transcription not enabled' }
    end

    Rails.logger.info "AudioTranscriptionService: Transcription enabled, starting transcription..."
    transcribed_text = transcribe_audio

    unless transcribed_text.present?
      Rails.logger.warn "AudioTranscriptionService: Transcription returned empty result for attachment #{attachment.id}"
      return { error: 'Transcription failed' }
    end

    Rails.logger.info "AudioTranscriptionService: Transcription successful, saving to attachment #{attachment.id}"

    attachment.meta ||= {}
    attachment.meta['transcribed_text'] = transcribed_text
    attachment.meta['stt_provider'] = @stt_provider if defined?(@stt_provider)
    attachment.save!

    message = attachment.message
    attachment.reload
    message.reload
    message.association(:attachments).reset

    Rails.configuration.dispatcher.dispatch(
      MESSAGE_UPDATED,
      Time.zone.now,
      message: message,
      previous_changes: { 'attachments' => [attachment.id] }
    )

    Rails.logger.info "AudioTranscriptionService: Transcription saved successfully for attachment #{attachment.id}"
    { success: true, transcribed_text: transcribed_text }
  rescue StandardError => e
    Rails.logger.error "AudioTranscriptionService: Error for attachment #{attachment.id}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    { error: e.message }
  end

  private

  def transcription_enabled?
    # Priority 1: Check global configuration OPENAI_ENABLE_AUDIO_TRANSCRIPTION
    global_enabled = GlobalConfigService.load('OPENAI_ENABLE_AUDIO_TRANSCRIPTION', nil)
    unless global_enabled.nil?
      enabled = booleanize(global_enabled)
      Rails.logger.info "AudioTranscriptionService: Global audio transcription flag: #{global_enabled.inspect} -> #{enabled.inspect}"
      return false unless enabled
    end

    configured_provider = active_stt_provider
    return false unless configured_provider

    api_key_present = api_key_for_provider(configured_provider).present?
    Rails.logger.info "AudioTranscriptionService: Active STT provider: #{configured_provider}, key configured: #{api_key_present}"
    api_key_present
  end

  def active_stt_provider
    # Priority 1: explicit STT provider override
    provider = (GlobalConfigService.load('STT_PROVIDER', nil) || ENV['STT_PROVIDER']).to_s.downcase.strip.presence
    return provider if provider.present? && STT_PROVIDERS.include?(provider)

    # Priority 2: provider inferred from active integrations
    if (hook = Hook.find_by(app_id: 'openrouter'))&.enabled? &&
       hook.settings&.[]('api_key').present?
      return 'openrouter'
    end

    if (hook = Hook.find_by(app_id: 'openai'))&.enabled? &&
       hook.settings&.[]('api_key').present?
      return 'openai'
    end

    # Priority 3: local free fallback if requested
    GlobalConfigService.load('STT_LOCAL_FALLBACK', false) ? 'local_whisper' : nil
  end

  def transcribe_audio
    return nil unless attachment.file.attached?

    audio_file = download_audio_file
    return nil unless audio_file

    provider = active_stt_provider
    @stt_provider = provider

    response = case provider
               when 'openrouter'
                 transcribe_with_openrouter(audio_file)
               when 'openai'
                 transcribe_with_openai(audio_file)
               when 'local_whisper'
                 transcribe_with_local_whisper(audio_file)
               else
                 Rails.logger.warn "AudioTranscriptionService: Unsupported provider #{provider.inspect}"
                 nil
               end

    File.delete(audio_file.path) if File.exist?(audio_file.path)
    response&.dig('text')
  rescue StandardError => e
    Rails.logger.error "AudioTranscriptionService: Transcription error with provider #{provider}: #{e.message}"
    nil
  end

  def transcribe_with_openrouter(audio_file)
    api_key = api_key_for_provider('openrouter')
    return nil unless api_key

    base_url = (GlobalConfigService.load('OPENROUTER_API_URL', nil) || ENV['OPENROUTER_API_URL'] || 'https://openrouter.ai/api/v1').to_s
    transcription_url = "#{base_url}/audio/transcriptions"

    file_extension = attachment.extension.presence || 'ogg'
    filename = "audio.#{file_extension}"

    http = Net::HTTP.new(URI(transcription_url).host, URI(transcription_url).port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(URI(transcription_url).path)
    request['Authorization'] = "Bearer #{api_key}"

    form_data = [
      ['file', audio_file, { filename: filename }],
      ['model', 'openai/whisper-1']
    ]

    detected_language = detect_language
    form_data << ['language', detected_language] if detected_language.present?

    request.set_form(form_data, 'multipart/form-data')

    Rails.logger.info "AudioTranscriptionService: OpenRouter transcription request to #{transcription_url}"
    response = http.request(request)
    Rails.logger.info "AudioTranscriptionService: OpenRouter transcription response: #{response.code}"

    if response.code == '200'
      JSON.parse(response.body)
    else
      Rails.logger.error "OpenRouter STT error: #{response.code} - #{response.body[0..400]}"
      nil
    end
  rescue StandardError => e
    Rails.logger.error "OpenRouter STT request error: #{e.class}: #{e.message}"
    nil
  end

  def transcribe_with_openai(audio_file)
    api_key = api_key_for_provider('openai')
    return nil unless api_key

    base_url = (GlobalConfigService.load('OPENAI_API_URL', nil) || ENV['OPENAI_API_URL'] || 'https://api.openai.com/v1').to_s
    transcription_url = "#{base_url}/audio/transcriptions"

    file_extension = attachment.extension.presence || 'ogg'
    filename = "audio.#{file_extension}"

    http = Net::HTTP.new(URI(transcription_url).host, URI(transcription_url).port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(URI(transcription_url).path)
    request['Authorization'] = "Bearer #{api_key}"

    form_data = [
      ['file', audio_file, { filename: filename }],
      ['model', 'whisper-1']
    ]

    detected_language = detect_language
    form_data << ['language', detected_language] if detected_language.present?

    request.set_form(form_data, 'multipart/form-data')

    Rails.logger.info "AudioTranscriptionService: OpenAI Whisper request to #{transcription_url}"
    response = http.request(request)
    Rails.logger.info "AudioTranscriptionService: OpenAI Whisper response: #{response.code}"

    if response.code == '200'
      JSON.parse(response.body)
    else
      Rails.logger.error "OpenAI Whisper error: #{response.code} - #{response.body[0..400]}"
      nil
    end
  end

  def transcribe_with_local_whisper(audio_file)
    raise 'Local Whisper CLI not available' if whisper_cli_path.blank?

    output_path = "#{audio_file.path}.txt"
    converted_path = "#{audio_file.path}_converted.wav"

    # FFmpeg converts WhatsApp audio to WAV format compatible with Whisper
    convert_result = system(
      whisper_cli_path,
      '-y',
      '-i', audio_file.path,
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      converted_path
    )

    return nil unless convert_result && File.exist?(converted_path)

    cmd = [whisper_cli_path, converted_path, '--model', 'base', '--language', 'pt', '--output_format', 'txt', '--output_dir', File.dirname(converted_path), '--print_colors', 'False'].compact
    Rails.logger.info "AudioTranscriptionService: Local whisper command: #{cmd.shelljoin}"

    stdout, stderr, status = Open3.capture3(*cmd)
    Rails.logger.info "AudioTranscriptionService: Local whisper stdout: #{stdout[0..400]}"
    Rails.logger.error "AudioTranscriptionService: Local whisper stderr: #{stderr[0..400]}" if stderr.present?

    transcript_path = "#{converted_path.chomp(File.extname(converted_path))}.txt"
    text = File.read(transcript_path) if File.exist?(transcript_path)
    text&.strip
  rescue StandardError => e
    Rails.logger.error "Local Whisper transcription failed: #{e.class}: #{e.message}"
    nil
  ensure
    File.delete(converted_path) if defined?(converted_path) && File.exist?(converted_path)
    File.delete(output_path) if defined?(output_path) && File.exist?(output_path)
  end

  def get_openai_api_key
    global_api_key = GlobalConfigService.load('OPENAI_API_SECRET', nil)
    return global_api_key if global_api_key.present?

    openai_hook = Hook.find_by(app_id: 'openai')
    return nil unless openai_hook&.enabled?
    openai_hook.settings&.[]('api_key')
  end

  def download_audio_file
    return nil unless attachment.file.attached?

    max_retries = 3
    retry_delay = 1

    max_retries.times do |attempt|
      begin
        file_extension = attachment.extension.presence || 'ogg'
        temp_file = Tempfile.new(['audio', ".#{file_extension}"])
        temp_file.binmode

        attachment.file.download do |chunk|
          temp_file.write(chunk)
        end

        temp_file.rewind
        Rails.logger.info "AudioTranscriptionService: Successfully downloaded audio file (attempt #{attempt + 1})"
        return temp_file
      rescue ActiveStorage::FileNotFoundError => e
        if attempt < max_retries - 1
          wait_time = retry_delay * (2 ** attempt)
          Rails.logger.warn "AudioTranscriptionService: File not found, retrying in #{wait_time}s (attempt #{attempt + 1}/#{max_retries})"
          sleep(wait_time)
        else
          Rails.logger.error "AudioTranscriptionService: Error downloading audio file after #{max_retries} attempts: #{e.message}"
          return nil
        end
      rescue StandardError => e
        Rails.logger.error "AudioTranscriptionService: Error downloading audio file: #{e.message}"
        return nil
      end
    end

    nil
  end

  def detect_language
    locale = GlobalConfigService.load('DEFAULT_LOCALE', nil)
    return 'pt' if locale&.start_with?('pt')
    return 'es' if locale&.start_with?('es')
    return 'fr' if locale&.start_with?('fr')
    return 'de' if locale&.start_with?('de')
    return 'it' if locale&.start_with?('it')
    'pt'  # Default to Portuguese when not detected
  end

  def api_key_for_provider(provider)
    return nil if provider.blank?

    if provider == 'openrouter'
      env_key = (ENV['OPENROUTER_API_KEY'] || ENV['OPENAI_API_KEY']).presence
      return env_key if env_key.present?

      openrouter_hook = Hook.find_by(app_id: 'openrouter')
      return openrouter_hook&.settings&.[]('api_key') if openrouter_hook&.enabled?
      return GlobalConfigService.load('OPENROUTER_API_KEY', nil)
    end

    if provider == 'openai'
      env_key = ENV['OPENAI_API_SECRET'].presence
      return env_key if env_key.present?

      openai_hook = Hook.find_by(app_id: 'openai')
      return openai_hook&.settings&.[]('api_key') if openai_hook&.enabled?
      return GlobalConfigService.load('OPENAI_API_SECRET', nil)
    end

    nil
  end

  def whisper_cli_path
    ENV['WHISPER_CLI_PATH'] || 'whisper'
  end

  def booleanize(value)
    return value if value.is_a?(TrueClass) || value.is_a?(FalseClass)

    case value.to_s.downcase
    when 'true', '1', 'yes', 'on'
      true
    else
      false
    end
  end
end
