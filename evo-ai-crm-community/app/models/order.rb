# == Schema Information
#
# Table name: orders
#
#  id             :uuid             not null, primary key
#  carrier        :string
#  invoice_number :string
#  payment_method :string
#  status         :integer          default("pending"), not null
#  total_amount   :decimal(15, 2)   default(0.0)
#  tracking_code  :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  contact_id     :uuid             not null
#  quote_id       :uuid
#
# Indexes
#
#  index_orders_on_contact_id  (contact_id)
#  index_orders_on_quote_id    (quote_id)
#
# Foreign Keys
#
#  fk_rails_...  (contact_id => contacts.id)
#  fk_rails_...  (quote_id => quotes.id)
#
class Order < ApplicationRecord
  belongs_to :quote, optional: true
  belongs_to :contact
  has_many :order_items, dependent: :destroy
  accepts_nested_attributes_for :order_items, allow_destroy: true

  enum status: { pending: 0, processing: 1, shipped: 2, delivered: 3, canceled: 4 }

  validates :total_amount, numericality: { greater_than_or_equal_to: 0 }
end
