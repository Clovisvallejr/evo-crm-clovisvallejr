import { Button, Badge } from '@evoapi/design-system';
import { Pencil, Trash2, ShoppingCart } from 'lucide-react';
import type { Order } from '@/types/orders';

interface Props {
  orders: Order[];
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Em Processamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

function formatPrice(value: number) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

export default function OrdersTable({
  orders,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: Props) {
  if (orders.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-md">
        Nenhum pedido encontrado.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="px-3 py-2 w-10"></th>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Cliente</th>
            <th className="px-3 py-2">Orçamento</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            return (
              <tr key={order.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </td>
                <td className="px-3 py-2 font-medium">#{String(order.id).substring(0, 8)}</td>
                <td className="px-3 py-2">{order.contact?.name || 'Cliente Desconhecido'}</td>
                <td className="px-3 py-2 text-muted-foreground hover:text-primary cursor-pointer underline-offset-4 hover:underline">
                    {order.quote_id ? `#${String(order.quote_id).substring(0, 8)}` : '-'}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={STATUS_VARIANT[order.status] ?? 'outline'}>
                    {STATUS_LABEL[order.status] || order.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {formatPrice(order.total_amount)}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canUpdate}
                    onClick={() => onEdit(order)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canDelete}
                    onClick={() => onDelete(order)}
                    title="Excluir"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
