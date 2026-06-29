import React, { useState, useEffect } from 'react';
import { quotesService } from '@/services/quotes/quotesService';
import { Quote } from '@/types/quotes';
import { productsService } from '@/services/products/productsService';
import { contactsService } from '@/services/contacts/contactsService';
import { Product } from '@/types/products';
import { Contact } from '@/types/contacts';
import { useToast } from '@/contexts/ToastContext';

const Quotes: React.FC = () => {
  const { success, error } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any | null>(null);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // New Quote State
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    contact_id: '',
    delivery_address: '',
    delivery_method: '',
    delivery_cost: 0,
  });
  const [formItems, setFormItems] = useState<{product_id: string, quantity: number, unit_price: number}[]>([]);;

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await quotesService.getQuotes();
        setQuotes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const handleEditQuoteClick = (quote: Quote) => {
    setFormData({
      contact_id: String(quote.contact_id || ''),
      delivery_address: quote.delivery_address || '',
      delivery_method: quote.delivery_method || '',
      delivery_cost: Number(quote.delivery_cost || 0),
    });
    setFormItems(
      (quote.quote_items || []).map(item => ({
        product_id: String(item.product_id),
        quantity: item.quantity,
        unit_price: Number(item.unit_price)
      }))
    );
    setEditingQuoteId(quote.id);
    setIsEditingQuote(true);
    setIsSheetOpen(false);
    setIsNewQuoteModalOpen(true);
  };

  const handleReview = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsSheetOpen(true);
  };

  const handleApproveQuote = async () => {
    if (!selectedQuote) return;
    try {
      await quotesService.approveQuote(selectedQuote.id);
      success('Orçamento aprovado e enviado!');
      setIsSheetOpen(false);
      // Reload quotes
      setLoading(true);
      const data = await quotesService.getQuotes();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to approve quote:', err);
      error('Erro ao aprovar orçamento.');
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await quotesService.deleteQuote(id);
        setQuotes(quotes.filter(q => q.id !== id));
      } catch (error) {
        console.error('Failed to delete quote:', error);
        alert('Erro ao excluir orçamento.');
      }
    }
  };

  useEffect(() => {
    if (isNewQuoteModalOpen) {
      contactsService.getActiveContacts().then(res => setCustomers(res.data || []));
      productsService.getProducts({ per_page: 100 }).then(res => setProductsList(res.data || []));
    } else {
      // Reset only if we are closing (not editing logic here, editing sets state before open)
      setFormData({ contact_id: '', delivery_address: '', delivery_method: '', delivery_cost: 0 });
      setFormItems([]);
      setIsEditingQuote(false);
      setEditingQuoteId(null);
    }
  }, [isNewQuoteModalOpen]);

  const handleProductSelect = (index: number, productId: string) => {
    const product = productsList.find(p => p.id === productId);
    const newItems = [...formItems];
    newItems[index] = {
      ...newItems[index],
      product_id: productId,
      unit_price: product ? product.default_price : 0
    };
    setFormItems(newItems);
  };

  const calculateSubtotal = () => {
    return formItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  };

  const handleCreateQuote = async () => {
    try {
      const validItems = formItems.filter(i => i.product_id && i.quantity > 0);
      if (!formData.contact_id || validItems.length === 0) {
        error('Selecione um cliente e pelo menos um produto válido.');
        return;
      }

      const payload = {
        contact_id: formData.contact_id,
        seller_id: '', // Would be current user
        delivery_address: formData.delivery_address,
        delivery_method: formData.delivery_method,
        delivery_cost: formData.delivery_cost,
        quote_items_attributes: validItems,
      };

      if (isEditingQuote && editingQuoteId) {
        await quotesService.updateQuote(editingQuoteId, payload as any);
        success('Orçamento atualizado com sucesso!');
      } else {
        await quotesService.createQuote(payload as any);
        success('Orçamento criado com sucesso!');
      }
      setIsNewQuoteModalOpen(false);
      setIsEditingQuote(false);
      setEditingQuoteId(null);
      setFormData({ contact_id: '', delivery_address: '', delivery_method: '', delivery_cost: 0 });
      setFormItems([]);

      setLoading(true);
      const data = await quotesService.getQuotes();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to create quote:', err);
      error('Erro ao criar orçamento. Tente novamente.');
    }
  };


  return (
    <div className="flex-1 overflow-auto p-6 relative">
      <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Orçamentos</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os orçamentos gerados pela IA ou criados manualmente.
            </p>
          </div>
          <button 
            onClick={() => setIsNewQuoteModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Novo Orçamento
          </button>
        </div>

        {/* Tabs */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-fit">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow">
            Aguardando Aprovação ({quotes.filter(q => q.status === 'draft' || q.status === 'sent').length})
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-foreground">
            Enviados ({quotes.filter(q => q.status === 'sent').length})
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-foreground">
            Aprovados / Pedidos ({quotes.filter(q => q.status === 'approved').length})
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Orçamento</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Origem</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Valor Total</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">Carregando orçamentos...</td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">Nenhum orçamento encontrado.</td>
                  </tr>
                ) : quotes.map((quote) => (
                  <tr key={quote.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                              <svg className="h-5 w-5 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <div className="flex flex-col">
                              <span className="font-medium">#{String(quote.id || '').substring(0, 8)}</span>
                          </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{quote.contact?.name || 'Cliente'}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50">
                        <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Manual/IA
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {quote.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(quote.total_amount || 0))}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{new Date(quote.created_at || '').toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 align-middle text-right space-x-2">
                      <button 
                        onClick={() => handleReview(quote)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                      >
                        Revisar
                      </button>
                      <button 
                        onClick={() => handleDeleteQuote(quote.id)}
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

      {/* Revisar Orçamento Modal - Centered Dialog */}
      {isSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setIsSheetOpen(false); }}
        >
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center sm:text-left shrink-0 p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center">
                  Revisar Orçamento #{String(selectedQuote?.id || '').substring(0, 8)}
                  <div className="ml-3 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50">
                    <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    {selectedQuote?.status}
                  </div>
                </h2>
                <button
                  className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  <span className="sr-only">Fechar</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Gerado a partir da conversa com {selectedQuote?.contact?.name || 'Cliente'}.</p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Dados do Cliente
                  </h3>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedQuote?.contact?.name || 'Cliente'}</p>
                  </div>
                </div>

                {/* Seller */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    Vendedor Responsável
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {selectedQuote?.seller?.name ? selectedQuote.seller.name.substring(0, 2).toUpperCase() : 'N/A'}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{selectedQuote?.seller?.name || 'Não atribuído'}</p>
                      <p className="text-xs text-muted-foreground">{selectedQuote?.ai_generated ? 'Gerado por IA' : 'Manual'}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:col-span-2">
                  <h3 className="font-medium text-sm mb-3 flex items-center text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    Logística e Entrega
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Endereço de Entrega</p>
                      <p className="text-sm font-medium">
                        {selectedQuote?.delivery_address || <span className="text-muted-foreground italic">Não informado</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Método de Envio</p>
                      <p className="text-sm font-medium">{selectedQuote?.delivery_method || <span className="text-muted-foreground italic">Não informado</span>}</p>
                      {selectedQuote?.delivery_cost && Number(selectedQuote.delivery_cost) > 0 ? (
                        <p className="text-sm text-emerald-500 font-medium">
                          Frete: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedQuote.delivery_cost))}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Frete: Não calculado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Produtos do Orçamento</h3>
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b bg-muted/50">
                      <tr className="border-b transition-colors">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Produto</th>
                        <th className="h-10 px-4 text-center font-medium text-muted-foreground">Qtd</th>
                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Valor Unit.</th>
                        <th className="h-10 px-4 text-right font-medium text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {selectedQuote?.quote_items?.map((item) => (
                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedProductDetails(item)}>
                          <td className="p-4 align-middle">
                            <div className="flex items-center space-x-3 group">
                              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border transition-all group-hover:ring-2 group-hover:ring-primary">
                                {item.product_image_url ? (
                                  <img src={item.product_image_url} alt={item.description} className="object-cover h-full w-full" />
                                ) : (
                                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium group-hover:text-primary transition-colors">{item.description || item.product?.name || 'Produto sem nome'}</span>
                                <span className="text-xs text-muted-foreground">SKU: {item.product_id} <span className="text-primary/70 ml-1 text-[10px]">(Clique para ver/editar)</span></span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-center">{item.quantity}</td>
                          <td className="p-4 align-middle text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.unit_price))}</td>
                          <td className="p-4 align-middle text-right font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.quantity) * Number(item.unit_price))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end pt-2 pr-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">
                      <span className="mr-4">Subtotal:</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedQuote?.total_amount || 0) - Number(selectedQuote?.delivery_cost || 0))}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="mr-4">Frete:</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedQuote?.delivery_cost || 0))}</span>
                    </div>
                    <div className="text-lg font-bold pt-2 border-t">
                      <span className="mr-4">Total:</span>
                      <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedQuote?.total_amount || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t shrink-0">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2 mt-2 sm:mt-0" onClick={() => setIsSheetOpen(false)}>Cancelar</button>
              {selectedQuote?.status !== 'approved' && (
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2 mt-2 sm:mt-0" onClick={() => selectedQuote && handleEditQuoteClick(selectedQuote)}>
                  Editar Orçamento
                </button>
              )}
              {selectedQuote?.status !== 'approved' && (
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2" onClick={handleApproveQuote}>
                  Aprovar & Enviar Orçamento
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      {isNewQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={(e) => { if (e.target === e.currentTarget) setIsNewQuoteModalOpen(false); }}>
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative">
                <div className="flex flex-col space-y-2 text-center sm:text-left shrink-0 p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">{isEditingQuote ? "Editar Orçamento" : "Criar Novo Orçamento"}</h2>
                        <button className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => setIsNewQuoteModalOpen(false)}>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            <span className="sr-only">Fechar</span>
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">Preencha os dados abaixo para gerar um novo orçamento manualmente.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cliente *</label>
                            <select 
                                value={formData.contact_id} 
                                onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Selecione um cliente...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium">Produtos / Serviços *</h3>
                            <button 
                                onClick={() => setFormItems([...formItems, { product_id: '', quantity: 1, unit_price: 0 }])}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                + Adicionar Produto
                            </button>
                        </div>
                        <div className="rounded-md border">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b bg-muted/50">
                                    <tr>
                                        <th className="h-9 px-4 text-left font-medium text-muted-foreground w-1/2">Item</th>
                                        <th className="h-9 px-4 text-center font-medium text-muted-foreground w-20">Qtd</th>
                                        <th className="h-9 px-4 text-right font-medium text-muted-foreground">Valor Unit.</th>
                                        <th className="h-9 px-4 text-right font-medium text-muted-foreground w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formItems.map((item, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="p-2">
                                                <select 
                                                    value={item.product_id}
                                                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {productsList.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    min="1"
                                                    onChange={(e) => {
                                                        const newItems = [...formItems];
                                                        newItems[idx].quantity = Number(e.target.value);
                                                        setFormItems(newItems);
                                                    }}
                                                    className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm text-center" 
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={item.unit_price} 
                                                    onChange={(e) => {
                                                        const newItems = [...formItems];
                                                        newItems[idx].unit_price = Number(e.target.value);
                                                        setFormItems(newItems);
                                                    }}
                                                    className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm text-right" 
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <button 
                                                    onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                                                    className="text-destructive hover:text-destructive/80 text-lg font-bold"
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {formItems.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-muted-foreground text-xs">
                                                Nenhum produto adicionado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end text-sm">
                            <span className="font-medium mr-4">Subtotal Estimado:</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateSubtotal())}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <h3 className="text-sm font-medium">Logística de Entrega</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Método de Envio</label>
                                <input 
                                    type="text" 
                                    value={formData.delivery_method}
                                    onChange={(e) => setFormData({...formData, delivery_method: e.target.value})}
                                    placeholder="Ex: Sedex" 
                                    className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Endereço</label>
                                <input 
                                    type="text" 
                                    value={formData.delivery_address}
                                    onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                                    placeholder="Rua, Número..." 
                                    className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Custo (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.delivery_cost}
                                    onChange={(e) => setFormData({...formData, delivery_cost: Number(e.target.value)})}
                                    className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t bg-muted/10 shrink-0">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2 mt-2 sm:mt-0" onClick={() => setIsNewQuoteModalOpen(false)}>Cancelar</button>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2" onClick={handleCreateQuote}>{isEditingQuote ? "Salvar Alterações" : "Criar Orçamento"}</button>
                </div>
            </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={(e) => { if (e.target === e.currentTarget) setSelectedProductDetails(null); }}>
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col relative">
                <div className="flex flex-col space-y-2 text-center sm:text-left shrink-0 p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Detalhes do Produto</h2>
                        <button className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => setSelectedProductDetails(null)}>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            <span className="sr-only">Fechar</span>
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 aspect-square rounded-lg bg-muted border flex items-center justify-center overflow-hidden shrink-0">
                            {selectedProductDetails.product_image_url ? (
                               <img src={selectedProductDetails.product_image_url} alt={selectedProductDetails.description} className="w-full h-full object-cover" />
                            ) : (
                               <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            )}
                        </div>
                        <div className="space-y-4 flex-1">
                            <div>
                                <h3 className="text-xl font-bold">{selectedProductDetails.description || selectedProductDetails.product?.name || 'Produto sem nome'}</h3>
                                <p className="text-sm text-muted-foreground">SKU: {selectedProductDetails.product_id}</p>
                            </div>
                            <p className="text-sm">{selectedProductDetails.product?.description || 'Nenhuma descrição disponível.'}</p>
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground">Preço Unitário</p>
                                <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedProductDetails.unit_price))}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-6 border-t bg-muted/10">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2" onClick={() => setSelectedProductDetails(null)}>Fechar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;
