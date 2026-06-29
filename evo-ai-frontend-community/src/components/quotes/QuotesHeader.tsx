import { Plus, Search } from 'lucide-react';
import { Button, Input } from '@evoapi/design-system';

interface Props {
  canCreate: boolean;
  onCreate: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function QuotesHeader({
  canCreate,
  onCreate,
  searchTerm,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os orçamentos solicitados por clientes ou gerados pela IA.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar orçamentos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {canCreate && (
          <Button onClick={onCreate} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        )}
      </div>
    </div>
  );
}
