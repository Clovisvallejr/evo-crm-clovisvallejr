export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  product_image_url: string;
  created_at: string;
  updated_at: string;
  product?: any;
}

export interface Order {
  id: string;
  quote_id: string;
  contact_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  carrier?: string;
  tracking_code?: string;
  payment_method?: string;
  invoice_number?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  contact?: any;
  quote?: any;
}

export interface OrderFormData {
  quote_id?: string;
  contact_id?: string;
  status?: string;
  total_amount?: number;
  carrier?: string;
  tracking_code?: string;
  payment_method?: string;
  invoice_number?: string;
  order_items_attributes?: any[];
}
