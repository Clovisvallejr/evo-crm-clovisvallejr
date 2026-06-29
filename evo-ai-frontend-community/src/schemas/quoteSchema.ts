import { z } from 'zod';

export const quoteItemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, 'Produto é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unit_price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  product_image_url: z.string().optional(),
});

export const quoteSchema = z.object({
  contact_id: z.string().min(1, 'Contato é obrigatório'),
  seller_id: z.string().optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected']).optional(),
  total_amount: z.number().min(0, 'Total deve ser maior ou igual a 0'),
  valid_until: z.string().optional(),
  ai_generated: z.boolean().optional().default(false),
  delivery_address: z.string().optional(),
  delivery_method: z.string().optional(),
  delivery_cost: z.number().min(0, 'Custo de entrega deve ser maior ou igual a 0').optional().default(0),
  quote_items_attributes: z.array(quoteItemSchema).min(1, 'Adicione pelo menos um produto'),
});

export type QuoteFormInput = z.infer<typeof quoteSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
