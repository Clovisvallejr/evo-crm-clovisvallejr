export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  product_image_url: string;
  created_at: string;
  updated_at: string;
  product?: any;
}

export interface Quote {
  id: string;
  contact_id: string;
  seller_id: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  total_amount: number;
  valid_until: string;
  ai_generated: boolean;
  delivery_address: string;
  delivery_method: string;
  delivery_cost: number;
  created_at: string;
  updated_at: string;
  quote_items: QuoteItem[];
  contact?: any;
  seller?: any;
}

export interface QuoteFormData {
  contact_id: string;
  seller_id: string;
  status?: string;
  total_amount?: number;
  valid_until?: string;
  ai_generated?: boolean;
  delivery_address?: string;
  delivery_method?: string;
  delivery_cost?: number;
  quote_items_attributes?: any[];
}
