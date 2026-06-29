import { useState, useEffect } from 'react';
import { quotesService } from '@/services/quotes/quotesService';
import type { Quote, QuoteFormData } from '@/types/quotes';

import QuotesHeader from '@/components/quotes/QuotesHeader';
import QuotesTable from '@/components/quotes/QuotesTable';
import QuotesPagination from '@/components/quotes/QuotesPagination';
import QuoteModal from '@/components/quotes/QuoteModal';

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>();

  useEffect(() => {
    fetchQuotes();
  }, [page, searchTerm]);

  const fetchQuotes = async () => {
    try {
      const data = await quotesService.getQuotes();
      const filtered = (Array.isArray(data) ? data : []).filter(q => 
        String(q.id).includes(searchTerm) || 
        (q.contact?.name && q.contact.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
      
      setQuotes(paginated);
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const handleCreate = () => {
    setSelectedQuote(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);
  };

  const handleDelete = async (quote: Quote) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
    try {
      await quotesService.deleteQuote(quote.id);
      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const handleSave = async (formData: QuoteFormData) => {
    try {
      if (selectedQuote) {
        await quotesService.updateQuote(selectedQuote.id, formData);
      } else {
        await quotesService.createQuote(formData);
      }
      fetchQuotes();
    } catch (error) {
      console.error('Error saving quote:', error);
      throw error;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 relative bg-background">
      <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
        <QuotesHeader
          canCreate={true}
          onCreate={handleCreate}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
        />

        <QuotesTable
          quotes={quotes}
          canUpdate={true}
          canDelete={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <QuotesPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />

        <QuoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          quote={selectedQuote}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
