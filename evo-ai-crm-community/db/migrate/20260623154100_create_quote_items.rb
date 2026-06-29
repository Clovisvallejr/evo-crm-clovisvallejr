class CreateQuoteItems < ActiveRecord::Migration[7.0]
  def change
    create_table :quote_items, id: :uuid do |t|
      t.references :quote, type: :uuid, null: false, foreign_key: true
      t.references :product, type: :uuid, null: true, foreign_key: true
      t.string :description
      t.integer :quantity, default: 1
      t.decimal :unit_price, precision: 15, scale: 2, default: 0.0
      t.string :product_image_url

      t.timestamps
    end
  end
end
