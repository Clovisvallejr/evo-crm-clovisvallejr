class EvolutionGo::FetchContactsJob < ApplicationJob
  queue_as :default

  def perform(channel_id)
    channel = Channel::Whatsapp.find_by(id: channel_id)
    return unless channel
    return unless channel.provider_config['instance_name'].present?

    instance_name = channel.provider_config['instance_name']
    admin_token = channel.provider_config['admin_token'] || GlobalConfigService.load('EVOLUTION_GO_ADMIN_SECRET', '').to_s.strip
    api_url = channel.provider_config['api_url'] || GlobalConfigService.load('EVOLUTION_GO_API_URL', '').to_s.strip
    
    return if admin_token.blank? || api_url.blank?

    endpoint = "#{api_url.chomp('/')}/chat/findContacts/#{instance_name}"

    Rails.logger.info "Evolution Go API: Fetching contacts manually for #{instance_name}..."

    begin
      response = HTTParty.post(
        endpoint,
        headers: { 'apikey' => admin_token, 'Content-Type' => 'application/json' },
        body: {}.to_json,
        timeout: 30
      )

      if response.success?
        Rails.logger.info "Evolution Go API: Successfully fetched contacts for #{instance_name}. Webhook should receive contacts.upsert or contacts.set shortly."
      else
        Rails.logger.warn "Evolution Go API: Failed to fetch contacts for #{instance_name}. Status: #{response.code}, Body: #{response.body}"
      end
    rescue StandardError => e
      Rails.logger.error "Evolution Go API: Error fetching contacts: #{e.message}"
    end
  end
end
