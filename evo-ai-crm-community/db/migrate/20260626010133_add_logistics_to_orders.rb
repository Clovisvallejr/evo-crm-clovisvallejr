class AddLogisticsToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :carrier, :string
    add_column :orders, :tracking_code, :string
    add_column :orders, :payment_method, :string
    add_column :orders, :invoice_number, :string
  end
end
