class CreateOrders < ActiveRecord::Migration[7.0]
  def change
    create_table :orders, id: :uuid do |t|
      t.references :quote, type: :uuid, null: true, foreign_key: true
      t.references :contact, type: :uuid, null: false, foreign_key: true
      t.integer :status, default: 0, null: false
      t.decimal :total_amount, precision: 15, scale: 2, default: 0.0

      t.timestamps
    end
  end
end
