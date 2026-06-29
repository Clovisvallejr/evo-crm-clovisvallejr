import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import { Quote, QuoteFormData } from '@/types/quotes';
import { Order } from '@/types/orders';

class QuotesService {
  private readonly baseUrl = '/quotes';

  async getQuotes(): Promise<Quote[]> {
    try {
      const response = await api.get(this.baseUrl);
      const data = response.data as Quote[];
      return data || [];
    } catch (error) {
      console.error('QuotesService.getQuotes error:', error);
      throw error;
    }
  }

  async getQuote(id: string): Promise<Quote> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return extractData<{ data: Quote }>(response).data;
  }

  async createQuote(payload: QuoteFormData): Promise<Quote> {
    const response = await api.post(this.baseUrl, { quote: payload });
    return response.data as Quote;
  }

  async updateQuote(id: string, payload: Partial<QuoteFormData>): Promise<Quote> {
    const response = await api.patch(`${this.baseUrl}/${id}`, { quote: payload });
    return response.data as Quote;
  }

  async deleteQuote(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async approveQuote(id: string): Promise<{ quote: Quote, order: Order }> {
    const response = await api.post(`${this.baseUrl}/${id}/approve`);
    return response.data;
  }
}

export const quotesService = new QuotesService();
