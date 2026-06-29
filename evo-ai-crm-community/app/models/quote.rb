# == Schema Information
#
# Table name: quotes
#
#  id               :uuid             not null, primary key
#  ai_generated     :boolean          default(FALSE)
#  delivery_address :text
#  delivery_cost    :decimal(15, 2)   default(0.0)
#  delivery_method  :string
#  public_token     :string
#  status           :integer          default("draft"), not null
#  total_amount     :decimal(15, 2)   default(0.0)
#  valid_until      :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  contact_id       :uuid             not null
#  seller_id        :uuid
#
# Indexes
#
#  index_quotes_on_contact_id    (contact_id)
#  index_quotes_on_public_token  (public_token) UNIQUE
#  index_quotes_on_seller_id     (seller_id)
#
# Foreign Keys
#
#  fk_rails_...  (contact_id => contacts.id)
#  fk_rails_...  (seller_id => users.id)
#
class Quote < ApplicationRecord
  belongs_to :contact
  belongs_to :seller, class_name: 'User', optional: true
  has_many :quote_items, dependent: :destroy
  accepts_nested_attributes_for :quote_items, allow_destroy: true

  enum status: { draft: 0, sent: 1, approved: 2, rejected: 3 }

  validates :total_amount, numericality: { greater_than_or_equal_to: 0 }

  before_create :generate_public_token

  def convert_to_order!
    return false unless approved?

    ActiveRecord::Base.transaction do
      order = Order.create!(
        quote: self,
        contact: self.contact,
        status: :pending,
        total_amount: self.total_amount
      )

      self.quote_items.each do |item|
        order.order_items.create!(
          product_id: item.product_id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          product_image_url: item.product_image_url
        )
      end

      order
    end
  end

  private

  def generate_public_token
    self.public_token = SecureRandom.urlsafe_base64(32) if public_token.blank?
  end
end
