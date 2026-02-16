import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './services/api';
import Sidebar from './components/Sidebar.tsx';
import TicketList from './components/TicketList.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import TicketDetail from './components/TicketDetail.tsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.tsx';
import AutomationScreen from './components/AutomationScreen.tsx';
import StoreManager from './components/StoreManager.tsx';
import type { User, Ticket, Order, Customer, Interaction, Store } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Modal State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Global Data State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeCount, setStoreCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch stores
      const { data: storesData } = await supabase.from('stores').select('*');

      // 3. Fetch auxiliary data
      const { data: ordersData } = await supabase.from('orders').select('*');
      const { data: customersData } = await supabase.from('customers').select('*');
      const { data: interactionsData } = await supabase.from('interactions').select('*');

      if (ticketsData) setTickets(ticketsData as unknown as Ticket[]);
      if (storesData) {
        setStores(storesData as unknown as Store[]);
        setStoreCount(storesData.length);
      }
      if (ordersData) setOrders(ordersData as unknown as Order[]);
      if (customersData) setCustomers(customersData as unknown as Customer[]);
      if (interactionsData) setInteractions(interactionsData as unknown as Interaction[]);

    } catch (error) {
      console.error("Erro na sincronização:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // 🔥 ENRICHED TICKETS LOGIC (ATUALIZADA)
  const enrichedTickets = tickets.map(ticket => {
    const order = orders.find(o => o.id === ticket.order_id);

    // Tenta achar o cliente pelo pedido. Se não achar (visitante), acha pelo E-mail!
    const customer = customers.find(c => c.id === order?.customer_id) || customers.find(c => c.email === ticket.customer_email);

    return {
      ...ticket,
      store_name: order?.store_name || 'Dúvida Geral',
      customer_name: customer?.name || 'Visitante',
      customer_email: customer?.email || ticket.customer_email,
    };
  });

  const handleOpenTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleCloseTicket = () => {
    setSelectedTicketId(null);
    fetchAllData();
  };

  if (!user) {
    return <LoginScreen onLogin={(u: any) => setUser(u)} />;
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400 gap-2 font-sans">
        <span className="material-symbols-outlined animate-spin text-blue-600">sync</span>
        Sincronizando OmniDesk AI...
      </div>
    );
  }

  // Derived data for modal
  let selectedTicketData = null;
  if (selectedTicketId) {
    const ticket = enrichedTickets.find(t => t.id === selectedTicketId);
    if (ticket) {
      const order = orders.find(o => o.id === ticket.order_id);

      // Garante que os dados do cliente vão pro Modal, seja ele comprador ou visitante
      const customer = customers.find(c => c.id === order?.customer_id) || customers.find(c => c.email === ticket.customer_email);
      const ticketMsgs = interactions.filter(i => i.ticket_id === ticket.id);

      selectedTicketData = { ticket, order, customer, ticketMsgs };
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <Sidebar
        user={user}
        storeCount={storeCount}
        pendingCount={tickets.filter(t => t.status === 'PENDING_HUMAN').length}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Routes>
          <Route path="/" element={
            <TicketList
              tickets={enrichedTickets}
              onSelectTicket={(ticket: Ticket) => handleOpenTicket(ticket.id)}
            />
          } />
          <Route path="/analytics" element={
            <AnalyticsDashboard tickets={enrichedTickets} stores={stores} />
          } />
          <Route path="/automation" element={<AutomationScreen />} />
          <Route path="/stores" element={
            <StoreManager onUpdateCount={setStoreCount} />
          } />
        </Routes>
      </main>

      {/* Modal Overlay */}
      {selectedTicketId && selectedTicketData && (
        <TicketDetail
          ticket={selectedTicketData.ticket}
          order={selectedTicketData.order || { id: 'unknown', store_name: 'Dúvida Geral', status: 'N/A', customer_id: '', tracking: '' }}
          customer={selectedTicketData.customer || { id: 'unknown', name: 'Visitante', email: selectedTicketData.ticket.customer_email || '-', avatar: `https://ui-avatars.com/api/?name=V&background=0D8ABC&color=fff`, sentiment: 'NEUTRAL' }}
          interactions={selectedTicketData.ticketMsgs}
          onClose={handleCloseTicket}
        />
      )}
    </div>
  );
}

export default App;