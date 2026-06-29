require 'net/http'
require 'json'
require 'open-uri'

namespace :products do
  desc "Import products and images from WordPress API"
  task import: :environment do
    puts "Buscando páginas (produtos) da API..."
    pages_uri = URI('https://imperiodosplasticos.com.br/wp-json/wp/v2/pages?per_page=100')
    pages_res = Net::HTTP.get_response(pages_uri)
    pages = JSON.parse(pages_res.body)

    puts "Buscando mídias (imagens) da API..."
    media_uri = URI('https://imperiodosplasticos.com.br/wp-json/wp/v2/media?per_page=100')
    media_res = Net::HTTP.get_response(media_uri)
    media_items = JSON.parse(media_res.body)

    # Filtrar páginas que parecem ser produtos base (remover SEO de cidades com " em ")
    base_products = pages.reject { |p| p['title']['rendered'].downcase.include?(' em ') || p['title']['rendered'].downcase.include?(' no ') || p['title']['rendered'].downcase == 'contato' || p['title']['rendered'].downcase == 'quem somos' || p['title']['rendered'].downcase == 'representante' || p['title']['rendered'].downcase == 'home' || p['title']['rendered'].downcase == 'produtos' }

    puts "Foram encontrados #{base_products.length} possíveis produtos base."

    base_products.take(15).each do |p|
      title = p['title']['rendered']
      
      # Extrair uma descrição limpa sem HTML pesado (apenas strip_tags básico)
      raw_desc = p['excerpt']['rendered'] || ""
      desc = ActionController::Base.helpers.strip_tags(raw_desc).squish
      
      product = Product.find_or_initialize_by(name: title)
      product.description = desc.presence || "Descrição do produto #{title}"
      product.default_price = 199.90 # Preço default genérico, pois o site não retorna preço via wp/v2/pages
      product.status = 'active'
      product.kind = 'physical'
      product.metadata ||= {}
      
      # Buscar imagens correspondentes no media
      # Normalizar nome para busca ex: "Carrinho 2 Cestas" -> "carrinho-2-cest"
      search_term = title.downcase.gsub(/[^a-z0-9]/, '-').gsub(/-+/, '-').chomp('-').sub(/as$/, '').sub(/os$/, '')
      
      matched_media = media_items.select do |m|
        media_url = m['source_url'].downcase
        media_url.include?(search_term) || media_url.include?(search_term[0..8])
      end.first(5) # Limita a 5 imagens conforme regra

      if product.save
        puts "Produto '#{title}' salvo."
        
        # Limpar imagens antigas para não acumular
        product.images.purge if product.images.attached?
        
        # Anexar imagens
        matched_media.each_with_index do |m, index|
          puts "  Baixando imagem #{index+1}: #{m['source_url']}"
          begin
            downloaded_image = URI.open(m['source_url'])
            filename = File.basename(URI.parse(m['source_url']).path)
            
            product.images.attach(io: downloaded_image, filename: filename, content_type: m['mime_type'])
          rescue => e
            puts "  Erro ao baixar imagem: #{e.message}"
          end
        end
        
        # Se não achou imagens, usa um fallback do placehold.co
        if product.images.empty?
          puts "  Nenhuma imagem correspondente encontrada, usando placeholder..."
          placeholder_url = "https://placehold.co/400x400/eeeeee/333333?text=#{URI.encode_www_form_component(title)}"
          begin
            downloaded = URI.open(placeholder_url)
            product.images.attach(io: downloaded, filename: "placeholder.png", content_type: "image/png")
          rescue => e
            puts "  Erro ao baixar placeholder: #{e.message}"
          end
        end

        # Atualizar metadata com o ID da primeira imagem (Cover)
        if product.images.attached?
          product.metadata['cover_image_id'] = product.images.first.id
          product.save
        end
      else
        puts "Erro ao salvar '#{title}': #{product.errors.full_messages}"
      end
    end
    
    puts "Importação concluída!"
  end
end
