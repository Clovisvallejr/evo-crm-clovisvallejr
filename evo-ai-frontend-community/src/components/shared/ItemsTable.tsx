import { Button } from '@evoapi/design-system';
import { Input } from '@evoapi/design-system';
import { Trash2, Plus } from 'lucide-react';

export interface TableItem {
  id?: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  product_image_url?: string;
}

interface ItemsTableProps {
  items: TableItem[];
  onUpdateItem: (index: number, field: string, value: any) => void;
  onRemoveItem: (index: number) => void;
  onAddItem?: () => void;
  title?: string;
  showImages?: boolean;
  error?: string;
  columns?: Array<'description' | 'quantity' | 'price' | 'subtotal'>;
}

export function ItemsTable({
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  title = 'Itens',
  showImages = false,
  error,
  columns = ['description', 'quantity', 'price', 'subtotal'],
}: ItemsTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-medium text-sm">{title}</label>
        {onAddItem && (
          <Button
            type="button"
            onClick={onAddItem}
            className="h-8 text-xs"
            variant="outline"
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {showImages && <th className="px-3 py-2 w-12"></th>}
              {columns.includes('description') && (
                <th className="px-3 py-2 text-left">Descricao</th>
              )}
              {columns.includes('quantity') && (
                <th className="px-3 py-2 w-20 text-center">Qtd</th>
              )}
              {columns.includes('price') && (
                <th className="px-3 py-2 w-28 text-right">Preco Unit.</th>
              )}
              {columns.includes('subtotal') && (
                <th className="px-3 py-2 w-28 text-right">Subtotal</th>
              )}
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showImages ? 2 : 1)}
                  className="px-3 py-6 text-center text-muted-foreground text-xs"
                >
                  Nenhum item adicionado
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const subtotal = item.quantity * item.unit_price;
                return (
                  <tr key={idx} className="border-t hover:bg-muted/20">
                    {showImages && (
                      <td className="px-3 py-2">
                        {item.product_image_url ? (
                          <img
                            src={item.product_image_url}
                            alt={item.description}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            Sem
                          </div>
                        )}
                      </td>
                    )}
                    {columns.includes('description') && (
                      <td className="px-3 py-2">
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) => onUpdateItem(idx, 'description', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Descricao..."
                        />
                      </td>
                    )}
                    {columns.includes('quantity') && (
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            onUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="h-8 w-full text-center text-xs"
                        />
                      </td>
                    )}
                    {columns.includes('price') && (
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) =>
                            onUpdateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)
                          }
                          className="h-8 w-full text-right text-xs"
                          placeholder="0.00"
                        />
                      </td>
                    )}
                    {columns.includes('subtotal') && (
                      <td className="px-3 py-2 text-right text-xs font-medium">
                        R$ {subtotal.toFixed(2)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveItem(idx)}
                        title="Remover item"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex justify-end gap-4 text-sm font-medium pt-2">
          <div>
            Subtotal:
            <span className="ml-2">
              R$ {items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemsTable;
