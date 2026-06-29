class CreateQuotes < ActiveRecord::Migration[7.0]
  def change
    create_table :quotes, id: :uuid do |t|
      t.references :contact, type: :uuid, null: false, foreign_key: true
      t.references :seller, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.integer :status, default: 0, null: false
      t.decimal :total_amount, precision: 15, scale: 2, default: 0.0
      t.datetime :valid_until
      t.boolean :ai_generated, default: false
      t.text :delivery_address
      t.string :delivery_method
      t.decimal :delivery_cost, precision: 15, scale: 2, default: 0.0

      t.timestamps
    end
  end
end
