import AppModal from './AppModal';
import { Button } from '@evoapi/design-system';
import { FileDown, Printer } from 'lucide-react';
import QuoteTemplate from './QuoteTemplate';
import { usePdfExport } from '@/hooks/usePdfExport';
import type { Quote } from '@/types/quotes';
import { useToast } from '@/contexts/ToastContext';

interface QuotePreviewModalProps {
  isOpen: boolean;
  quote: Quote;
  onClose: () => void;
  onConfirm?: () => void;
}

export function QuotePreviewModal({
  isOpen,
  quote,
  onClose,
  onConfirm,
}: QuotePreviewModalProps) {
  const { exportToPdf, printElement } = usePdfExport();
  const { success } = useToast();

  const handleExportPdf = () => {
    exportToPdf('quote-template', {
      filename: `orcamento-${quote.id}.pdf`,
      margin: 10,
      pageSize: 'a4',
      orientation: 'portrait',
    });
    success('PDF exportado com sucesso!');
  };

  const handlePrint = () => {
    printElement('quote-template');
  };

  return (
    <AppModal
      open={isOpen}
      onOpenChange={onClose}
      title="Visualizar Orcamento"
      maxWidthClass="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportPdf}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {onConfirm && (
              <Button onClick={onConfirm}>
                Confirmar e Salvar
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div
        style={{
          overflowY: 'auto',
          height: '100%',
          backgroundColor: '#f5f5f5',
          padding: '20px',
        }}
      >
        <div style={{ backgroundColor: 'white', marginBottom: '20px' }}>
          <QuoteTemplate
            quote={quote}
            conditions={[
              '* Primeira compra a vista.',
              '* Valor Minimo de pedido R$ 500.',
              '* A empresa nao emite nota fiscal em valor inferior a este.',
              '* Caso precise, oferecemos a opcao de personalizar os produtos com o nome da sua empresa.',
              '* Apos a primeira compra as demais compras liberacao da mercadoria mediante aprovacao de credito e / ou confirmacao de deposito.',
              '* Caso nao tenha no estoque liberacao em aproximadamente 7 a 10 dias uteis ou a combinar.',
              '* Frete FOB ou seja, a Mercadoria deve ser retirada pelo cliente ou transportadora por ele indicada.',
            ]}
          />
        </div>
      </div>
    </AppModal>
  );
}

export default QuotePreviewModal;
