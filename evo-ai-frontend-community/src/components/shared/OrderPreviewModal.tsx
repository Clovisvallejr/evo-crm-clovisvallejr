
import AppModal from './AppModal';
import { Button } from '@evoapi/design-system';
import { FileDown, Printer } from 'lucide-react';
import OrderTemplate from './OrderTemplate';
import { usePdfExport } from '@/hooks/usePdfExport';
import type { Order } from '@/types/orders';
import { useToast } from '@/contexts/ToastContext';

interface OrderPreviewModalProps {
  isOpen: boolean;
  order: Order;
  onClose: () => void;
  onConfirm?: () => void;
}

export function OrderPreviewModal({
  isOpen,
  order,
  onClose,
  onConfirm,
}: OrderPreviewModalProps) {
  const { exportToPdf, printElement } = usePdfExport();
  const { success } = useToast();

  const handleExportPdf = () => {
    exportToPdf('order-template', {
      filename: `pedido-${order.id}.pdf`,
      margin: 10,
      pageSize: 'a4',
      orientation: 'portrait',
    });
    success('PDF exportado com sucesso!');
  };

  const handlePrint = () => {
    printElement('order-template');
  };

  return (
    <AppModal
      open={isOpen}
      onOpenChange={onClose}
      title="Visualizar Pedido"
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
          <OrderTemplate
            order={order}
            companyName="IMPERIO DO PLÁSTICO"
            conditions={[
              '* Primeira compra à vista.',
              '* Valor Mínimo de pedido R$ 500.',
              '* A empresa não emite nota fiscal em valor inferior a este.',
              '* Caso precise, oferecemos a opção de personalizar os produtos com o nome da sua empresa.',
              '* Após a primeira compra as demais compras liberação da mercadoria mediante aprovação de credito e / ou confirmação de deposito.',
              '* Caso não tenha no estoque liberação em aproximadamente 7 a 10 dias úteis ou a combinar.',
              '* Frete FOB ou seja, a Mercadoria deve ser retirada pelo cliente ou transportadora por ele indicada.',
            ]}
          />
        </div>
      </div>
    </AppModal>
  );
}

export default OrderPreviewModal;
