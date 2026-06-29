import { useState, useEffect } from 'react';
import { ordersService } from '@/services/orders/ordersService';
import type { Order, OrderFormData } from '@/types/orders';

import OrdersHeader from '@/components/orders/OrdersHeader';
import OrdersTable from '@/components/orders/OrdersTable';
import OrdersPagination from '@/components/orders/OrdersPagination';
import OrderModal from '@/components/orders/OrderModal';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();

  useEffect(() => {
    fetchOrders();
  }, [page, searchTerm]);

  const fetchOrders = async () => {
    try {
      const data = await ordersService.getOrders();
      // Em uma API real, os parâmetros page e search seriam passados
      const filtered = (Array.isArray(data) ? data : []).filter(o => 
        String(o.id).includes(searchTerm) || 
        (o.contact?.name && o.contact.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
      
      setOrders(paginated);
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = async (order: Order) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      await ordersService.deleteOrder(order.id);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleSave = async (formData: OrderFormData) => {
    try {
      if (selectedOrder) {
        await ordersService.updateOrder(selectedOrder.id, formData);
      } else {
        await ordersService.createOrder(formData);
      }
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 relative bg-background">
      <div className="flex flex-col space-y-6 max-w-7xl mx-auto">
        <OrdersHeader
          canCreate={true}
          onCreate={handleCreate}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
        />

        <OrdersTable
          orders={orders}
          canUpdate={true}
          canDelete={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <OrdersPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />

        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
