import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label } from '@evoapi/design-system';
import { Trash2, Search } from 'lucide-react';
import type { Order, OrderFormData } from '@/types/orders';
import { productsService } from '@/services/products/productsService';
import type { Product } from '@/types/products';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  onSave: (data: OrderFormData) => Promise<void>;
}

export default function OrderModal({ isOpen, onClose, order, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    contact_id: '',
    status: 'pending',
    total_amount: 0,
    order_items_attributes: [],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        contact_id: order.contact_id,
        quote_id: order.quote_id,
        status: order.status,
        total_amount: order.total_amount,
        order_items_attributes: order.order_items?.map(i => ({ ...i })) || [],
      });
    } else {
      setFormData({
        contact_id: '',
        status: 'pending',
        total_amount: 0,
        order_items_attributes: [],
      });
    }
  }, [order, isOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsService.getProducts();
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    if (isOpen) fetchProducts();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProductToOrder = (product: Product) => {
    const newItem = {
      product_id: product.id,
      description: product.name,
      quantity: 1,
      unit_price: product.default_price || 0,
      product_image_url: (product as any).image_url,
    };
    
    const newItems = [...(formData.order_items_attributes || []), newItem];
    const total = newItems.reduce((acc, curr) => acc + (curr.unit_price * curr.quantity), 0);
    
    setFormData({
      ...formData,
      order_items_attributes: newItems,
      total_amount: total
    });
    setShowProductDropdown(false);
    setProductSearch('');
  };

  const removeProduct = (index: number) => {
    const newItems = [...(formData.order_items_attributes || [])];
    newItems.splice(index, 1);
    const total = newItems.reduce((acc, curr) => acc + (curr.unit_price * curr.quantity), 0);
    setFormData({ ...formData, order_items_attributes: newItems, total_amount: total });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{order ? 'Editar Pedido' : 'Novo Pedido'}</DialogTitle>
        </DialogHeader>
      <form onSubmit={handleSubmit} className="overflow-y-auto space-y-6 pr-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID do Contato</Label>
              <Input
                required
                value={formData.contact_id}
                onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                placeholder="Ex: 123"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="pending">Pendente</option>
                <option value="processing">Em Processamento</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

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
                    filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                        onClick={() => addProductToOrder(p)}
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
                  {(formData.order_items_attributes || []).map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2 text-center">
                        <Input 
                          type="number" 
                          min="1"
                          className="h-8 w-16 text-center"
                          value={item.quantity} 
                          onChange={(e) => {
                            const newItems = [...formData.order_items_attributes!];
                            newItems[idx].quantity = parseInt(e.target.value) || 1;
                            const total = newItems.reduce((acc, curr) => acc + (curr.unit_price * curr.quantity), 0);
                            setFormData({ ...formData, order_items_attributes: newItems, total_amount: total });
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">R$ {item.unit_price?.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeProduct(idx)} type="button">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!formData.order_items_attributes || formData.order_items_attributes.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground text-xs">
                        Nenhum produto adicionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end pt-4 font-medium">
              Total: R$ {(formData.total_amount || 0).toFixed(2)}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}
