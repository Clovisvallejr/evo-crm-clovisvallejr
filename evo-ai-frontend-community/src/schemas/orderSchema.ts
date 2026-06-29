import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, 'Produto é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unit_price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  product_image_url: z.string().optional(),
});

export const orderSchema = z.object({
  quote_id: z.string().optional(),
  contact_id: z.string().min(1, 'Contato é obrigatório'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional().default('pending'),
  total_amount: z.number().min(0, 'Total deve ser maior ou igual a 0'),
  carrier: z.string().optional().nullable(),
  tracking_code: z.string().optional().nullable(),
  payment_method: z.enum(['credit_card', 'debit_card', 'boleto', 'pix', 'transfer']).optional().nullable(),
  invoice_number: z.string().optional().nullable(),
  order_items_attributes: z.array(orderItemSchema).min(1, 'Adicione pelo menos um produto'),
});

export type OrderFormInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
