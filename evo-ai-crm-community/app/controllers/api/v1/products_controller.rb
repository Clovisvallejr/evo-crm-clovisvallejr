class Api::V1::ProductsController < Api::V1::BaseController
  require_permissions({
    index:   'products.read',
    show:    'products.read',
    create:  'products.create',
    update:  'products.update',
    destroy: 'products.delete'
  })

  before_action :fetch_product, only: %i[show update destroy]

  def index
    @products = filtered_products

    apply_pagination

    paginated_response(
      data: ProductSerializer.serialize_collection(@products),
      collection: @products,
      message: 'Products retrieved successfully'
    )
  end

  def show
    success_response(
      data: ProductSerializer.serialize(@product),
      message: 'Product retrieved successfully'
    )
  end

  def create
    @product = Product.new(product_params)

    if @product.save
      attach_images
      apply_labels
      success_response(
        data: ProductSerializer.serialize(@product.reload),
        message: 'Product created successfully',
        status: :created
      )
    else
      validation_error_response(@product)
    end
  end

  def update
    if @product.update(product_params)
      attach_images
      apply_labels
      success_response(
        data: ProductSerializer.serialize(@product.reload),
        message: 'Product updated successfully'
      )
    else
      validation_error_response(@product)
    end
  end

  def destroy
    if @product.destroy
      success_response(
        data: { id: @product.id },
        message: 'Product deleted successfully'
      )
    else
      # restrict_with_error on pipeline_item_products / variants in use
      error_response(
        code: ApiErrorCodes::VALIDATION_ERROR,
        message: 'Product is in use and cannot be deleted',
        details: @product.errors.full_messages,
        status: :unprocessable_entity
      )
    end
  end

  private

  def fetch_product
    @product = Product.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    error_response(
      code: ApiErrorCodes::RESOURCE_NOT_FOUND,
      message: "Product with id #{params[:id]} not found",
      status: :not_found
    )
  end

  def filtered_products
    scope = Product.all
    scope = scope.by_kind(params[:kind])
    scope = scope.by_status(params[:status])
    if params[:q].present?
      term = "%#{params[:q]}%"
      scope = scope.where('name ILIKE :t OR sku ILIKE :t OR description ILIKE :t', t: term)
    end
    scope.order_by_recent
  end

  def product_params
    parsed_params = params.require(:product).permit(
      :name, :slug, :kind, :description, :sku,
      :default_price, :currency, :purchase_url,
      :status, :stock_quantity,
      metadata: {},
      variants_attributes: [
        :id, :_destroy, :name, :sku,
        :price_override, :stock_quantity, :position,
        attributes_data: {}
      ]
    )
    
    raw_metadata = params.dig(:product, :metadata)
    if raw_metadata.is_a?(String)
      begin
        parsed_params[:metadata] = JSON.parse(raw_metadata)
      rescue JSON::ParserError
        parsed_params[:metadata] = {}
      end
    end
    
    parsed_params
  end

  def label_list_param
    raw = params.dig(:product, :labels) || params[:labels]
    return nil if raw.nil?

    Array(raw).map(&:to_s)
  end

  def apply_labels
    list = label_list_param
    return if list.nil?

    @product.update_labels(list)
  end

  def attach_images
    deleted_ids = Array(params.dig(:product, :deleted_image_ids) || params[:deleted_image_ids])
    if deleted_ids.any?
      @product.images.attachments.where(id: deleted_ids).each(&:purge)
    end

    images_param = Array(params.dig(:product, :images) || params[:images])
    return if images_param.empty?

    # Attach raw uploaded files
    raw_files = images_param.select { |img| img.respond_to?(:read) }
    @product.images.attach(raw_files) if raw_files.any?

    # Attach signed_ids (from direct uploads, if any)
    signed_ids = images_param.reject { |img| img.respond_to?(:read) }
    signed_ids.each do |signed_id|
      blob = ActiveStorage::Blob.find_signed(signed_id)
      @product.images.attach(blob) if blob.present?
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      next
    end
  end

  def validation_error_response(record)
    error_response(
      code: ApiErrorCodes::VALIDATION_ERROR,
      message: 'Validation failed',
      details: record.errors.full_messages,
      status: :unprocessable_entity
    )
  end
end
