class AddPublicTokenToQuotes < ActiveRecord::Migration[7.1]
  def change
    add_column :quotes, :public_token, :string
    add_index :quotes, :public_token, unique: true
  end
end
