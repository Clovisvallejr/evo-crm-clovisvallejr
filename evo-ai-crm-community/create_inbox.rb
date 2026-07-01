account = Account.first || Account.create!(name: 'Império CRM')
channel = Channel::Whatsapp.create!(
  account_id: account.id,
  phone_number: '+5511999999999',
  provider: 'evolution_go',
  provider_config: {
    'instance_name' => 'Suporte',
    'api_url' => 'https://evogo.imperiocrm.com.br',
    'admin_token' => 'imperio_evo_api_key_2026'
  }
)
inbox = Inbox.create!(
  account_id: account.id,
  channel: channel,
  name: 'WhatsApp Evolution (Suporte)'
)
puts "Inbox created with ID: #{inbox.id}"
