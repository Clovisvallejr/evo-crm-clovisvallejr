import React, { useState, useEffect } from 'react';
import { ordersService } from '@/services/orders/ordersService';
import { Order } from '@/types/orders';
import { useToast } from '@/contexts/ToastContext';

const Orders: React.FC = () => {
  const { success, error } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setFormData({
      status: selectedOrder?.status || 'pending',
      carrier: selectedOrder?.carrier || '',
      tracking_code: selectedOrder?.tracking_code || '',
      payment_method: selectedOrder?.payment_method || '',
      invoice_number: selectedOrder?.invoice_number || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const updated = await ordersService.updateOrder(selectedOrder.id, formData);
      setOrders(orders.map(o => o.id === updated.id ? updated : o));
      setSelectedOrder(updated);
      setIsEditing(false);
      success('Pedido atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      error('Erro ao atualizar o pedido. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersService.getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        error('Erro ao carregar pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleManage = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const handleDelete = async (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await ordersService.deleteOrder(orderId);
        setOrders(orders.filter(o => o.id !== orderId));
        success('Pedido excluído com sucesso!');
      } catch (err) {
        console.error('Failed to delete order:', err);
        error('Erro ao excluir o pedido. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 relative">
      <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
        {/* Page Title */}
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
            <p className="text-sm text-muted-foreground">Acompanhe os orçamentos que foram aprovados e viraram pedidos de venda.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Aguardando Pgto</h3>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
                      )}
                    </p>
                </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Em Separação</h3>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</div>
                    <p className="text-xs text-muted-foreground">Prontos para envio</p>
                </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Enviados (Mês)</h3>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{orders.filter(o => o.status === 'shipped').length}</div>
                    <p className="text-xs text-emerald-500">Em transporte</p>
                </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Entregues</h3>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</div>
                    <p className="text-xs text-muted-foreground">Confirmadas</p>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-fit">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all bg-background text-foreground shadow">Todos</button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all hover:text-foreground">Aguardando Pagamento</button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all hover:text-foreground">Em Separação</button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all hover:text-foreground">Enviados</button>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-0">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Pedido</th>
                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Orçamento Base</th>
                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Pagamento</th>
                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Logística</th>
                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Valor</th>
                                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-muted-foreground">Carregando pedidos...</td>
                              </tr>
                            ) : orders.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-muted-foreground">Nenhum pedido encontrado.</td>
                              </tr>
                            ) : orders.map((order) => (
                              <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                                  <td className="p-4 align-middle font-medium">#{String(order.id || '').substring(0, 8)}</td>
                                  <td className="p-4 align-middle">
                                      <div className="flex flex-col">
                                          <span className="font-medium">{order.contact?.name || 'Cliente'}</span>
                                      </div>
                                  </td>
                                  <td className="p-4 align-middle text-muted-foreground hover:text-primary cursor-pointer underline-offset-4 hover:underline">
                                      {order.quote_id ? `#${String(order.quote_id || '').substring(0, 8)}` : '-'}
                                  </td>
                                  <td className="p-4 align-middle">
                                      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">
                                          <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                          {order.status}
                                      </div>
                                  </td>
                                  <td className="p-4 align-middle">
                                      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">
                                          <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                          {order.status === 'pending' ? 'Aguardando' : order.status === 'processing' ? 'Separando' : 'Em Trânsito'}
                                      </div>
                                  </td>
                                  <td className="p-4 align-middle font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total_amount || 0))}
                                  </td>
                                  <td className="p-4 align-middle text-right space-x-2">
                                      <button
                                          onClick={() => handleManage(order)}
                                          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent h-8 px-3"
                                      >
                                          Gerenciar
                                      </button>
                                      <button
                                          onClick={() => handleDelete(order.id)}
                                          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-destructive/10 text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground h-8 px-3"
                                      >
                                          Excluir
                                      </button>
                                  </td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* Order Details Modal - Centered Dialog */}
      {isSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setIsSheetOpen(false); }}
        >
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex flex-col space-y-1.5 p-6 border-b shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center">
                  Pedido #{String(selectedOrder?.id || '').substring(0, 8)}
                  <div className="ml-3 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">
                    {selectedOrder?.status}
                  </div>
                </h2>
                <button
                  className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => {
                    setIsSheetOpen(false);
                    setIsEditing(false);
                  }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  <span className="sr-only">Fechar</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Criado a partir do orçamento {selectedOrder?.quote_id ? <span className="text-primary hover:underline cursor-pointer">#{String(selectedOrder.quote_id || '').substring(0, 8)}</span> : 'N/A'}
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Timeline */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status do Pedido</h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-xs font-medium mt-2">Aprovado</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-primary mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-xs font-medium mt-2">Pago</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-primary mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${selectedOrder?.status === 'processing' || selectedOrder?.status === 'shipped' || selectedOrder?.status === 'delivered' ? 'bg-primary text-primary-foreground' : 'border-2 border-primary text-primary bg-background'}`}>
                      {selectedOrder?.status === 'processing' || selectedOrder?.status === 'shipped' || selectedOrder?.status === 'delivered' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-xs font-medium mt-2">Em Separação</span>
                  </div>
                  <div className={`flex-1 h-[2px] mx-2 ${selectedOrder?.status === 'shipped' || selectedOrder?.status === 'delivered' ? 'bg-primary' : 'bg-muted'}`}></div>
                  <div className="flex flex-col items-center opacity-50">
                    <div className="h-8 w-8 rounded-full border-2 border-muted text-muted-foreground flex items-center justify-center bg-background">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    </div>
                    <span className="text-xs font-medium mt-2">Enviado</span>
                  </div>
                </div>
              </div>

              {/* Logistics and Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium text-sm mb-3 text-muted-foreground flex justify-between items-center">
                    Logística e Rastreio
                    {!isEditing && (
                      <button onClick={handleEdit} className="text-primary text-xs hover:underline">
                        Editar
                      </button>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      {isEditing ? (
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="pending">Pendente</option>
                          <option value="processing">Processando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregue</option>
                          <option value="canceled">Cancelado</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium">{selectedOrder?.status}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transportadora</p>
                      {isEditing ? (
                        <input
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={formData.carrier || ''}
                          onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                          placeholder="Ex: Jadlog"
                        />
                      ) : (
                        <p className="text-sm font-medium">{selectedOrder?.carrier || 'Não informada'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Código de Rastreio</p>
                      {isEditing ? (
                        <input
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={formData.tracking_code || ''}
                          onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
                          placeholder="Ex: BR123..."
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{selectedOrder?.tracking_code || 'Não informado'}</p>
                          {selectedOrder?.tracking_code && (
                            <button className="text-xs text-primary hover:underline">Rastrear</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium text-sm mb-3 text-muted-foreground flex justify-between items-center">
                    Faturamento
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Forma de Pagamento</p>
                      {isEditing ? (
                        <input
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={formData.payment_method || ''}
                          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                          placeholder="Ex: PIX, Cartão"
                        />
                      ) : (
                        <p className="text-sm font-medium">{selectedOrder?.payment_method || 'Não informada'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nota Fiscal (NF-e)</p>
                      {isEditing ? (
                        <input
                          type="text"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={formData.invoice_number || ''}
                          onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                          placeholder="Nº da NF-e"
                        />
                      ) : (
                        <p className="text-sm font-medium">
                          {selectedOrder?.invoice_number ? (
                            <span className="text-emerald-500 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              Emitida (Nº {selectedOrder.invoice_number})
                            </span>
                          ) : (
                            'Não emitida'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Produtos do Pedido</h3>
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b bg-muted/50">
                      <tr className="border-b transition-colors">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Produto</th>
                        <th className="h-10 px-4 text-center font-medium text-muted-foreground">Qtd</th>
                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder?.order_items?.map((item) => (
                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                                {item.product_image_url ? (
                                  <img src={item.product_image_url} alt={item.description} className="object-cover h-full w-full" />
                                ) : (
                                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.description || item.product?.name || 'Produto sem nome'}</span>
                                <span className="text-xs text-muted-foreground">SKU: {item.product_id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-center">{item.quantity}</td>
                          <td className="p-4 align-middle text-right font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.quantity) * Number(item.unit_price))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end pt-2 pr-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">
                      <span className="mr-4">Frete:</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="text-lg font-bold pt-2 border-t">
                      <span className="mr-4">Total Pago:</span>
                      <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedOrder?.total_amount || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t shrink-0">
              {isEditing ? (
                <>
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2 mt-2 sm:mt-0"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({});
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow h-9 px-4 py-2 mt-2 sm:mt-0"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </>
              ) : (
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2 mt-2 sm:mt-0"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
