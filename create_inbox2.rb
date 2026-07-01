# script to create inbox
account = Account.first || Account.create!(name: 'Império CRM')

# Evolution Go Channel
channel = Channel::Whatsapp.create!(
  account_id: account.id,
  phone_number: '+5511999999999',
  provider: 'evolution_go',
  provider_config: {
    'instance_name' => 'Evolution',
    'api_url' => 'https://evogo.imperiocrm.com.br',
    'admin_token' => 'imperio_evo_api_key_2026'
  }
)

# Inbox
inbox = Inbox.create!(
  account_id: account.id,
  channel: channel,
  name: 'WhatsApp (Evolution)'
)

puts "INBOX_CREATED_WITH_ID: #{inbox.id}"
