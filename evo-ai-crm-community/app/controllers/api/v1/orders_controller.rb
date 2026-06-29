class Api::V1::OrdersController < Api::V1::BaseController
  require_permissions({
    index:   'orders.read',
    show:    'orders.read',
    create:  'orders.create',
    update:  'orders.update',
    destroy: 'orders.delete'
  })

  before_action :set_order, only: [:show, :update, :destroy]

  def index
    @orders = Order.includes(:contact, :quote, order_items: :product).all
    render json: @orders.as_json(include: { contact: {}, quote: {}, order_items: { include: :product } })
  end

  def show
    render json: @order.as_json(include: { contact: {}, quote: {}, order_items: { include: :product } })
  end

  def create
    @order = Order.new(order_params)
    if @order.save
      render json: @order, status: :created
    else
      render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @order.update(order_params)
      render json: @order
    else
      render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @order.destroy
    head :no_content
  end

  private

  def set_order
    @order = Order.find(params[:id])
  end

  def order_params
    params.require(:order).permit(
      :quote_id, :contact_id, :status, :total_amount,
      :carrier, :tracking_code, :payment_method, :invoice_number,
      order_items_attributes: [:id, :product_id, :description, :quantity, :unit_price, :product_image_url, :_destroy]
    )
  end
end
