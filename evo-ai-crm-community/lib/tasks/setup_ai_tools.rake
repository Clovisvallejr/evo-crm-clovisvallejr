namespace :ai do
  desc "Register AI custom tools for Quotes"
  task setup_tools: :environment do
    puts "Registering AI tools..."

    tools = [
      {
        name: "search_products",
        description: "Lista e busca produtos cadastrados no CRM para informar ao cliente. Pode buscar por nome ou categoria.",
        endpoint: "http://evo-crm-clovisvallejr-2.crm-net:3000/api/v1/products", # assuming docker internal networking, or use internal env var
        method: "GET",
        input_modes: ["auto"],
        output_modes: ["auto"],
        query_params: {
          search: "{search_term}"
        }
      },
      {
        name: "create_quote",
        description: "Cria um novo orçamento para o cliente com base nos produtos negociados.",
        endpoint: "http://evo-crm-clovisvallejr-2.crm-net:3000/api/v1/quotes",
        method: "POST",
        input_modes: ["auto"],
        output_modes: ["auto"],
        body_params: {
          quote: {
            contact_id: "{contact_id}",
            status: "draft",
            ai_generated: true,
            quote_items_attributes: "{items}"
          }
        }
      }
    ]

    tools.each do |tool|
      begin
        response = EvoAiCoreService.create_custom_tool(tool, {})
        puts "Success registering #{tool[:name]}: #{response}"
      rescue StandardError => e
        puts "Failed to register #{tool[:name]}: #{e.message}"
      end
    end
  end
end
