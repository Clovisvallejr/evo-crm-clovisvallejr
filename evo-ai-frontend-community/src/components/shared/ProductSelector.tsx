import { useState, useEffect, useRef } from 'react';
import { Input } from '@evoapi/design-system';
import { Search, X, Plus } from 'lucide-react';
import type { Product } from '@/types/products';
import { useToast } from '@/contexts/ToastContext';

interface ProductSelectorProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxItems?: number;
  selectedCount?: number;
}

export function ProductSelector({
  products,
  onSelectProduct,
  isLoading = false,
  placeholder = 'Buscar produtos...',
  maxItems = 999,
  selectedCount = 0,
}: ProductSelectorProps) {
  const { warning } = useToast();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const canAddMore = selectedCount < maxItems;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    if (!canAddMore) {
      warning(`Limite de ${maxItems} itens atingido`);
      return;
    }
    onSelectProduct(product);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={!canAddMore || isLoading}
          className="flex-1"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando produtos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {search ? 'Nenhum produto encontrado' : 'Digite para buscar'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  disabled={!canAddMore}
                  className="w-full px-4 py-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {product.name}
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {product.sku && <span className="flex-shrink-0">{product.sku}</span>}
                      {product.description && (
                        <span className="truncate">
                          {product.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="font-medium text-sm">
                      R$ {product.default_price?.toFixed(2) || '0.00'}
                    </span>
                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <div
            className="p-2 text-xs text-center border-t bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Fechar dropdown
          </div>
        </div>
      )}

      {!canAddMore && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
          ⚠️ Limite de {maxItems} itens atingido
        </div>
      )}
    </div>
  );
}

export default ProductSelector;
