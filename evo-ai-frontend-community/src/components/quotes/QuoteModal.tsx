import { useState, useEffect, useMemo } from 'react';
import AppModal from '@/components/shared/AppModal';
import { Button, Input, Label } from '@evoapi/design-system';
import { Trash2, Search, Bot, Eye } from 'lucide-react';
import type { Quote, QuoteFormData } from '@/types/quotes';
import { productsService } from '@/services/products/productsService';
import type { Product } from '@/types/products';
import { useToast } from '@/contexts/ToastContext';
import { quoteSchema } from '@/schemas/quoteSchema';
import QuotePreviewModal from '@/components/shared/QuotePreviewModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quote?: Quote;
  onSave: (data: QuoteFormData) => Promise<void>;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function QuoteModal({ isOpen, onClose, quote, onSave }: Props) {
  const { error: showError, success: showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<QuoteFormData>({
    contact_id: '',
    seller_id: '',
    status: 'draft',
    total_amount: 0,
    ai_generated: false,
    quote_items_attributes: [],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-calculate total when items change
  const calculatedTotal = useMemo(() => {
    const itemsTotal = (formData.quote_items_attributes || []).reduce(
      (acc, curr) => acc + (curr.unit_price * curr.quantity),
      0
    );
    const deliveryCost = formData.delivery_cost || 0;
    return itemsTotal + deliveryCost;
  }, [formData.quote_items_attributes, formData.delivery_cost]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, total_amount: calculatedTotal }));
  }, [calculatedTotal]);

  useEffect(() => {
    if (quote) {
      setFormData({
        contact_id: quote.contact_id,
        seller_id: quote.seller_id,
        status: quote.status,
        total_amount: quote.total_amount,
        valid_until: quote.valid_until ? new Date(quote.valid_until).toISOString().split('T')[0] : '',
        ai_generated: quote.ai_generated,
        delivery_address: quote.delivery_address,
        delivery_method: quote.delivery_method,
        delivery_cost: quote.delivery_cost,
        quote_items_attributes: quote.quote_items?.map(i => ({ ...i })) || [],
      });
    } else {
      setFormData({
        contact_id: '',
        seller_id: '',
        status: 'draft',
        total_amount: 0,
        ai_generated: false,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delivery_cost: 0,
        quote_items_attributes: [],
      });
    }
    setErrors({});
  }, [quote, isOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsService.getProducts();
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
        showError('Erro ao carregar produtos');
      }
    };
    if (isOpen) fetchProducts();
  }, [isOpen, showError]);

  const validateForm = async (): Promise<boolean> => {
    try {
      await quoteSchema.parseAsync(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: ValidationErrors = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path.join('.');
          newErrors[field] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!(await validateForm())) {
      showError('Verifique os erros no formulário');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      showSuccess(quote ? 'Orçamento atualizado!' : 'Orçamento criado com sucesso!');
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Erro ao salvar orçamento';
      showError(errorMessage);
      console.error('Error saving quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProductToQuote = (product: Product) => {
    const newItem = {
      product_id: product.id,
      description: product.name,
      quantity: 1,
      unit_price: product.default_price || 0,
      product_image_url: (product as any).image_url,
    };

    setFormData({
      ...formData,
      quote_items_attributes: [...(formData.quote_items_attributes || []), newItem],
    });
    setShowProductDropdown(false);
    setProductSearch('');
    showSuccess(`${product.name} adicionado!`);
  };

  const removeProduct = (index: number) => {
    const removedItem = formData.quote_items_attributes?.[index];
    const newItems = [...(formData.quote_items_attributes || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, quote_items_attributes: newItems });
    if (removedItem) {
      showSuccess(`${removedItem.description} removido`);
    }
  };

  const updateQuoteItem = (index: number, field: string, value: any) => {
    const newItems = [...(formData.quote_items_attributes || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, quote_items_attributes: newItems });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())),
  );

  return (
    <AppModal
      open={isOpen}
      onOpenChange={onClose}
      title={quote ? 'Editar Orçamento' : 'Novo Orçamento'}
      maxWidthClass="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={loading}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button type="submit" disabled={loading} form="quote-form">
            {loading ? 'Salvando...' : quote ? 'Atualizar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="quote-form" onSubmit={handleSubmit} className="overflow-y-auto space-y-6 pr-2">
        {/* Erro geral */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID do Contato *</Label>
              <Input
                value={formData.contact_id}
                onChange={(e) => {
                  setFormData({ ...formData, contact_id: e.target.value });
                  if (errors.contact_id) {
                    setErrors({ ...errors, contact_id: '' });
                  }
                }}
                placeholder="Ex: 123"
                className={errors.contact_id ? 'border-red-500' : ''}
              />
              {errors.contact_id && (
                <span className="text-xs text-red-600">{errors.contact_id}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Vendedor Responsável (ID)</Label>
              <Input
                value={formData.seller_id}
                onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                placeholder="Ex: 456"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as QuoteFormData['status'] })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviado</option>
                <option value="accepted">Aceito</option>
                <option value="rejected">Rejeitado</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Validade</Label>
              <Input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
          </div>

          {formData.ai_generated && (
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-md flex items-center text-sm font-medium">
              <Bot className="h-4 w-4 mr-2" />
              Este orçamento foi gerado automaticamente pela IA.
            </div>
          )}

          <div className="space-y-2">
            <Label>Produtos</Label>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar produtos para adicionar..."
                  value={productSearch}
                  onFocus={() => setShowProductDropdown(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                />
              </div>
              {showProductDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">Nenhum produto encontrado.</div>
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                        onClick={() => addProductToQuote(p)}
                      >
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{p.sku}</span>
                        </div>
                        <span className="text-sm">R$ {p.default_price?.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                  <div
                    className="p-2 text-xs text-center border-t bg-muted/50 cursor-pointer hover:bg-muted"
                    onClick={() => setShowProductDropdown(false)}
                  >
                    Fechar
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-md mt-4">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left">Produto</th>
                    <th className="px-3 py-2 text-center w-24">Qtd</th>
                    <th className="px-3 py-2 text-right">Preço</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.quote_items_attributes || []).map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2 text-center">
                        <Input
                          type="number"
                          min="1"
                          className="h-8 w-16 text-center"
                          value={item.quantity}
                          onChange={(e) => updateQuoteItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-8 w-24 text-right"
                          value={item.unit_price}
                          onChange={(e) => updateQuoteItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeProduct(idx)} type="button">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!formData.quote_items_attributes || formData.quote_items_attributes.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground text-xs">
                        Nenhum produto adicionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {errors.quote_items_attributes && (
              <span className="text-xs text-red-600">{errors.quote_items_attributes}</span>
            )}
          </div>

          {/* Delivery Information */}
          <div className="border-t pt-4">
            <Label className="font-semibold mb-3 block">Informações de Entrega</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Método de Entrega</Label>
                <Input
                  value={formData.delivery_method || ''}
                  onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                  placeholder="Ex: Sedex, PAC, Retirada..."
                />
              </div>

              <div className="space-y-2">
                <Label>Endereço de Entrega</Label>
                <textarea
                  value={formData.delivery_address || ''}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="Endereço completo para entrega..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Custo de Entrega</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delivery_cost || 0}
                  onChange={(e) => setFormData({ ...formData, delivery_cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between mb-2 text-sm">
                <span>Subtotal (Produtos):</span>
                <span>R$ {((formData.quote_items_attributes || []).reduce((acc, curr) => acc + (curr.unit_price * curr.quantity), 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Entrega:</span>
                <span>R$ {(formData.delivery_cost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Total:</span>
                <span>R$ {(formData.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      <QuotePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        quote={{ ...formData, id: quote?.id || '', created_at: quote?.created_at || new Date().toISOString(), updated_at: new Date().toISOString() } as Quote}
        onConfirm={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
      />
    </AppModal>
  );
}
