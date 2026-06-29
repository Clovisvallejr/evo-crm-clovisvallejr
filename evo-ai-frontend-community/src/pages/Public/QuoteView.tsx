import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_image_url?: string;
  product?: {
    id: string;
    name: string;
    description?: string;
    sku?: string;
  };
}

interface QuoteContact {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
}

interface QuoteData {
  id: string;
  public_token: string;
  status: string;
  total_amount: number;
  delivery_address?: string;
  delivery_method?: string;
  delivery_cost?: number;
  valid_until?: string;
  ai_generated: boolean;
  created_at: string;
  contact: QuoteContact;
  seller?: { id: string; name: string; email?: string };
  quote_items: QuoteItem[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "#f59e0b" },
  sent: { label: "Enviado", color: "#3b82f6" },
  approved: { label: "Aprovado", color: "#10b981" },
  rejected: { label: "Recusado", color: "#ef4444" },
};

export default function PublicQuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/quotes/${token}/public`);
        setQuote(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Orçamento não encontrado. Verifique o link e tente novamente.");
        } else {
          setError("Erro ao carregar o orçamento. Tente novamente mais tarde.");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Carregando orçamento...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Orçamento não encontrado</h2>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  const statusInfo = statusLabels[quote.status] || { label: quote.status, color: "#6b7280" };
  const subtotal = quote.quote_items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.brandName}>Império CRM</h1>
          <p style={styles.headerSubtitle}>Proposta Comercial</p>
        </div>
        <div style={styles.headerRight}>
          <span style={{ ...styles.statusBadge, backgroundColor: statusInfo.color }}>
            {statusInfo.label}
          </span>
          {quote.ai_generated && (
            <span style={styles.aiBadge}>✨ Gerado pela IA</span>
          )}
        </div>
      </div>

      {/* Quote Info */}
      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>📋 Dados do Orçamento</h3>
          <p style={styles.infoLine}><strong>Número:</strong> {quote.id.slice(0, 8).toUpperCase()}</p>
          <p style={styles.infoLine}><strong>Criado em:</strong> {formatDate(quote.created_at)}</p>
          {quote.valid_until && (
            <p style={styles.infoLine}><strong>Válido até:</strong> {formatDate(quote.valid_until)}</p>
          )}
          {quote.seller && (
            <p style={styles.infoLine}><strong>Vendedor:</strong> {quote.seller.name}</p>
          )}
        </div>
        <div style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>👤 Cliente</h3>
          <p style={styles.infoLine}><strong>Nome:</strong> {quote.contact.name}</p>
          {quote.contact.email && (
            <p style={styles.infoLine}><strong>E-mail:</strong> {quote.contact.email}</p>
          )}
          {quote.contact.phone_number && (
            <p style={styles.infoLine}><strong>Telefone:</strong> {quote.contact.phone_number}</p>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Produtos / Serviços</h2>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.th, width: "50px" }}></th>
                <th style={styles.th}>Produto</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Qtd</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Preço Unit.</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quote.quote_items.map((item, idx) => (
                <tr key={item.id} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>
                    {item.product_image_url ? (
                      <img
                        src={item.product_image_url}
                        alt={item.product?.name || item.description}
                        style={styles.productImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={styles.productImagePlaceholder}>📦</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <strong style={styles.productName}>
                      {item.product?.name || item.description}
                    </strong>
                    {item.description && item.product?.name && (
                      <p style={styles.productDesc}>{item.description}</p>
                    )}
                    {item.product?.sku && (
                      <p style={styles.productSku}>SKU: {item.product.sku}</p>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>{formatCurrency(item.unit_price)}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600 }}>
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summaryContainer}>
        <div style={styles.summaryBox}>
          <div style={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {quote.delivery_cost !== undefined && quote.delivery_cost !== null && (
            <div style={styles.summaryRow}>
              <span>Entrega {quote.delivery_method ? `(${quote.delivery_method})` : ""}</span>
              <span>{formatCurrency(Number(quote.delivery_cost))}</span>
            </div>
          )}
          <div style={styles.summaryTotal}>
            <span>Total</span>
            <span>{formatCurrency(Number(quote.total_amount))}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      {quote.delivery_address && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🚚 Entrega</h2>
          <p style={styles.infoLine}><strong>Endereço:</strong> {quote.delivery_address}</p>
          {quote.delivery_method && (
            <p style={styles.infoLine}><strong>Método:</strong> {quote.delivery_method}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions} className="no-print">
        <button onClick={handlePrint} style={styles.printBtn}>
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <div style={styles.footer}>
        <p>Este orçamento foi gerado automaticamente pelo sistema Império CRM.</p>
        <p>Para dúvidas, entre em contato com nossos vendedores.</p>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "0",
    color: "#1a1a2e",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "16px",
    background: "#f0f4ff",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: "16px",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "12px",
    padding: "32px",
    background: "#fff5f5",
  },
  errorIcon: { fontSize: "64px" },
  errorTitle: { fontSize: "24px", color: "#c53030", margin: 0 },
  errorText: { color: "#718096", textAlign: "center", maxWidth: "400px" },
  header: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    color: "white",
    padding: "32px 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {},
  brandName: {
    fontSize: "28px",
    fontWeight: 800,
    margin: "0 0 4px 0",
    background: "linear-gradient(90deg, #a78bfa, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerSubtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "14px",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  statusBadge: {
    padding: "6px 16px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  aiBadge: {
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 600,
    background: "rgba(165, 139, 250, 0.2)",
    color: "#a78bfa",
    border: "1px solid rgba(165, 139, 250, 0.4)",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    padding: "32px 48px",
    background: "white",
    borderBottom: "1px solid #e5e7eb",
  },
  infoCard: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },
  infoCardTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#475569",
    margin: "0 0 12px 0",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  infoLine: {
    margin: "6px 0",
    fontSize: "14px",
    color: "#374151",
  },
  section: {
    padding: "32px 48px",
    background: "white",
    marginTop: "1px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0 0 20px 0",
    borderBottom: "2px solid #6366f1",
    paddingBottom: "8px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  trEven: { background: "#ffffff" },
  trOdd: { background: "#f8fafc" },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#374151",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
  },
  productImage: {
    width: "48px",
    height: "48px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  productImagePlaceholder: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "20px",
  },
  productName: { display: "block", fontSize: "14px", color: "#1a1a2e" },
  productDesc: { margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" },
  productSku: { margin: "2px 0 0 0", fontSize: "11px", color: "#9ca3af" },
  summaryContainer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "0 48px 32px 48px",
    background: "white",
  },
  summaryBox: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px 28px",
    minWidth: "300px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#6b7280",
    padding: "6px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "20px",
    fontWeight: 800,
    color: "#1a1a2e",
    padding: "14px 0 0 0",
    marginTop: "8px",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    padding: "24px",
    background: "#f8fafc",
    borderTop: "1px solid #e5e7eb",
  },
  printBtn: {
    padding: "14px 32px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
    transition: "all 0.2s",
  },
  footer: {
    padding: "20px 48px",
    background: "#1a1a2e",
    color: "#64748b",
    fontSize: "12px",
    textAlign: "center",
  },
};
