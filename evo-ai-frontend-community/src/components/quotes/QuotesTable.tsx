import { Button, Badge } from '@evoapi/design-system';
import { Pencil, Trash2, FileText, Bot } from 'lucide-react';
import type { Quote } from '@/types/quotes';

interface Props {
  quotes: Quote[];
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  sent: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  expired: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  expired: 'Expirado',
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

export default function QuotesTable({
  quotes,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: Props) {
  if (quotes.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-md">
        Nenhum orçamento encontrado.
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
            <th className="px-3 py-2">Criador</th>
            <th className="px-3 py-2">Válido até</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            return (
              <tr key={quote.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </td>
                <td className="px-3 py-2 font-medium">#{String(quote.id).substring(0, 8)}</td>
                <td className="px-3 py-2">{quote.contact?.name || 'Cliente Desconhecido'}</td>
                <td className="px-3 py-2">
                  {quote.ai_generated ? (
                    <span className="flex items-center text-primary text-xs font-medium">
                      <Bot className="h-3 w-3 mr-1" /> IA
                    </span>
                  ) : (
                    <span>Vendedor/Humano</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '-'}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={STATUS_VARIANT[quote.status] ?? 'outline'}>
                    {STATUS_LABEL[quote.status] || quote.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {formatPrice(quote.total_amount)}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canUpdate}
                    onClick={() => onEdit(quote)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canDelete}
                    onClick={() => onDelete(quote)}
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
