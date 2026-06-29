
import type { Order } from '@/types/orders';

interface OrderTemplateProps {
  order: Order;
  companyName?: string;
  companyLogo?: string;
  conditions?: string[];
}

export function OrderTemplate({
  order,
  companyLogo,
  conditions = [
    '* Primeira compra à vista.',
    '* Valor Mínimo de pedido R$ 500.',
    '* A empresa não emite nota fiscal em valor inferior a este.',
    '* Caso precise, oferecemos a opção de personalizar os produtos com o nome da sua empresa.',
    '* Após a primeira compra as demais compras liberação da mercadoria mediante aprovação de credito e / ou confirmação de deposito.',
    '* Caso não tenha no estoque liberação em aproximadamente 7 a 10 dias úteis ou a combinar.',
    '* Frete FOB ou seja, a Mercadoria deve ser retirada pelo cliente ou transportadora por ele indicada.',
  ],
}: OrderTemplateProps) {
  const generateReference = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const reference = generateReference();
  const subtotal = (order.order_items || []).reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );
  const freight = 0;
  const discount = 0;
  const total = subtotal + freight - discount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'PENDENTE',
      processing: 'PROCESSANDO',
      shipped: 'ENVIADO',
      delivered: 'ENTREGUE',
      cancelled: 'CANCELADO',
    };
    return labels[status] || status;
  };

  return (
    <div
      id="order-template"
      style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px',
        backgroundColor: 'white',
        color: '#333',
        lineHeight: '1.6',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div>
          {companyLogo && (
            <img
              src={companyLogo}
              alt="Logo"
              style={{ height: '60px', marginBottom: '10px' }}
            />
          )}
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#003366' }}>
            SOLUÇÕES EM PLÁSTICO
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 5px 0',
              color: '#003366',
            }}
          >
            PEDIDO
          </h1>
          <div style={{ fontSize: '12px', color: '#666' }}>
            REFERÊNCIA: #{reference}
          </div>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: order.status === 'delivered' ? '#4caf50' : '#ff9800',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 'bold',
              marginTop: '8px',
            }}
          >
            {getStatusLabel(order.status as string)}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
            Emissão: {formatDate()}
          </div>
        </div>
      </div>

      {/* General Info */}
      <div style={{ marginBottom: '30px' }}>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '10px 15px',
            fontWeight: 'bold',
            fontSize: '12px',
            marginBottom: '10px',
            borderRadius: '3px',
          }}
        >
          INFORMAÇÕES GERAIS DO PEDIDO
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontWeight: 'bold',
                  width: '20%',
                  backgroundColor: '#f9f9f9',
                }}
              >
                CLIENTE:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.contact?.name || 'N/A'}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontWeight: 'bold',
                  width: '20%',
                  backgroundColor: '#f9f9f9',
                }}
              >
                TRANSPORTADORA:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.carrier || 'N/A'}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#f9f9f9',
                }}
              >
                CONTATO:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.contact?.phone || 'N/A'}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#f9f9f9',
                }}
              >
                RASTREIO:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.tracking_code || 'N/A'}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#f9f9f9',
                }}
              >
                PAGAMENTO:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.payment_method || 'N/A'}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#f9f9f9',
                }}
              >
                NF-e:
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                {order.invoice_number || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '30px' }}>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '10px 15px',
            fontWeight: 'bold',
            fontSize: '12px',
            marginBottom: '10px',
            borderRadius: '3px',
          }}
        >
          ITENS DO PEDIDO
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#003366', color: 'white' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                PRODUTO
              </th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                QTDE
              </th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                VALOR UNIT.
              </th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                TOTAL
              </th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                IMAGEM
              </th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || []).map((item, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                  {item.description}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                  {item.quantity}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>
                  {formatCurrency(item.unit_price)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(item.quantity * item.unit_price)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.description}
                      style={{
                        height: '80px',
                        width: '80px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '80px',
                        width: '80px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      Sem imagem
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '30px',
        }}
      >
        <div style={{ width: '400px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #ddd',
            }}
          >
            <span>Total dos Produtos:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(subtotal)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '2px solid #003366',
            }}
          >
            <span>(-) Desconto:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(discount)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '15px 0',
              backgroundColor: '#f0f0f0',
              paddingLeft: '15px',
              paddingRight: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#003366',
            }}
          >
            <span>TOTAL DO PEDIDO:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div>
        <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>CONDIÇÕES GERAIS</h3>
        <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
          {conditions.map((condition, idx) => (
            <div key={idx}>{condition}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderTemplate;
