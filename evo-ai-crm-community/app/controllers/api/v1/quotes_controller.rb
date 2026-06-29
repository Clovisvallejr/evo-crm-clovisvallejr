class Api::V1::QuotesController < Api::V1::BaseController
  require_permissions({
    index:   'quotes.read',
    show:    'quotes.read',
    create:  'quotes.create',
    update:  'quotes.update',
    destroy: 'quotes.delete',
    approve: 'quotes.approve'
  })

  before_action :set_quote, only: [:show, :update, :destroy, :approve]

  def index
    @quotes = Quote.includes(:contact, :seller, quote_items: :product).all
    render json: @quotes.as_json(include: { contact: {}, seller: {}, quote_items: { include: :product } })
  end

  def show
    render json: @quote.as_json(include: { contact: {}, seller: {}, quote_items: { include: :product } })
  end

  def create
    @quote = Quote.new(quote_params)
    if @quote.save
      render json: @quote, status: :created
    else
      render json: { errors: @quote.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @quote.update(quote_params)
      render json: @quote
    else
      render json: { errors: @quote.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @quote.destroy
    head :no_content
  end

  def approve
    if @quote.update(status: :approved)
      order = @quote.convert_to_order!
      render json: { quote: @quote, order: order }, status: :ok
    else
      render json: { errors: @quote.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_quote
    @quote = Quote.find(params[:id])
  end

  def quote_params
    params.require(:quote).permit(
      :contact_id, :seller_id, :status, :total_amount, :valid_until,
      :ai_generated, :delivery_address, :delivery_method, :delivery_cost,
      quote_items_attributes: [:id, :product_id, :description, :quantity, :unit_price, :product_image_url, :_destroy]
    )
  end
end
