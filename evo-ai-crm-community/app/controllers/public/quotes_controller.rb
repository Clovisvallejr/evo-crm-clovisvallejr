class Public::QuotesController < ApplicationController
  # No authentication required - public endpoint
  skip_before_action :authenticate_user!, raise: false
  skip_before_action :verify_authenticity_token

  def show
    @quote = Quote.includes(
      :contact,
      :seller,
      quote_items: :product
    ).find_by(public_token: params[:token])

    if @quote.nil?
      render json: { error: "Orçamento não encontrado ou token inválido." }, status: :not_found
      return
    end

    render json: {
      id: @quote.id,
      public_token: @quote.public_token,
      status: @quote.status,
      total_amount: @quote.total_amount,
      delivery_address: @quote.delivery_address,
      delivery_method: @quote.delivery_method,
      delivery_cost: @quote.delivery_cost,
      valid_until: @quote.valid_until,
      ai_generated: @quote.ai_generated,
      created_at: @quote.created_at,
      updated_at: @quote.updated_at,
      contact: @quote.contact.as_json(only: [:id, :name, :email, :phone_number]),
      seller: @quote.seller&.as_json(only: [:id, :name, :email]),
      quote_items: @quote.quote_items.map do |item|
        {
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          product_image_url: item.product_image_url.presence || (item.product&.images&.attached? ? Rails.application.routes.url_helpers.rails_blob_url(item.product.images.first, host: Rails.application.routes.default_url_options[:host] || ENV.fetch('BACKEND_URL', 'http://localhost:3000')) : nil),
          subtotal: item.quantity.to_f * item.unit_price.to_f,
          product: item.product&.as_json(only: [:id, :name, :description, :sku])
        }
      end
    }
  end
end
