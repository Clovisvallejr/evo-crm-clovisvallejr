import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import { Order, OrderFormData } from '@/types/orders';

class OrdersService {
  private readonly baseUrl = '/orders';

  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get(this.baseUrl);
      const data = response.data as Order[];
      return data || [];
    } catch (error) {
      console.error('OrdersService.getOrders error:', error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return extractData<{ data: Order }>(response).data;
  }

  async createOrder(payload: OrderFormData): Promise<Order> {
    const response = await api.post(this.baseUrl, { order: payload });
    return extractData<{ data: Order }>(response).data;
  }

  async updateOrder(id: string, payload: Partial<OrderFormData>): Promise<Order> {
    const response = await api.patch(`${this.baseUrl}/${id}`, { order: payload });
    return response.data as Order;
  }

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export const ordersService = new OrdersService();
