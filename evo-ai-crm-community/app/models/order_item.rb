# == Schema Information
#
# Table name: order_items
#
#  id                :uuid             not null, primary key
#  description       :string
#  product_image_url :string
#  quantity          :integer          default(1)
#  unit_price        :decimal(15, 2)   default(0.0)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  order_id          :uuid             not null
#  product_id        :uuid
#
# Indexes
#
#  index_order_items_on_order_id    (order_id)
#  index_order_items_on_product_id  (product_id)
#
# Foreign Keys
#
#  fk_rails_...  (order_id => orders.id)
#  fk_rails_...  (product_id => products.id)
#
class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product, optional: true

  validates :quantity, numericality: { greater_than: 0 }
  validates :unit_price, numericality: { greater_than_or_equal_to: 0 }

  def as_json(options = {})
    super(options).merge(
      'product_image_url' => product_image_url.presence || (product&.images&.attached? ? Rails.application.routes.url_helpers.rails_blob_url(product.images.first, host: Rails.application.routes.default_url_options[:host] || ENV.fetch('BACKEND_URL', 'http://localhost:3000')) : nil)
    )
  end
end
