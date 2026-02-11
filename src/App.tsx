/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from './services/api';
import Sidebar from './components/Sidebar';
import TicketList from './components/TicketList';
import LoginScreen from './components/LoginScreen';
import TicketDetail from './components/TicketDetail';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AutomationScreen from './components/AutomationScreen';
import StoreManager from './components/StoreManager';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  // Estados Globais de Dados
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [stores, setStores] = useState([]); // Estado para as lojas reais
  const [storeCount, setStoreCount] = useState(0); 
  const [loading, setLoading] = useState(false);

  // Busca centralizada de todas as informações do banco
  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Busca todos os tickets (sem filtros para as abas funcionarem)
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      // 2. Busca todas as lojas cadastradas
      const { data: storesData } = await supabase.from('stores').select('*');
      
      // 3. Busca dados auxiliares
      const { data: ordersData } = await supabase.from('orders').select('*');
      const { data: customersData } = await supabase.from('customers').select('*');
      const { data: interactionsData } = await supabase.from('interactions').select('*');

      if (ticketsData) setTickets(ticketsData);
      if (storesData) {
        setStores(storesData);
        setStoreCount(storesData.length);
      }
      if (ordersData) setOrders(ordersData);
      if (customersData) setCustomers(customersData);
      if (interactionsData) setInteractions(interactionsData);
      
    } catch (error) {
      console.error("Erro na sincronização:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user, currentView]);

  const handleOpenTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setCurrentView('ticket_detail');
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Roteador de Views
  const renderContent = () => {
    if (loading && tickets.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-slate-400 gap-2 font-sans">
          <span className="material-symbols-outlined animate-spin text-blue-600">sync</span>
          Sincronizando OmniDesk AI...
        </div>
      );
    }

    // TELA: CHAT DETALHADO
    if (currentView === 'ticket_detail' && selectedTicketId) {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      const order = orders.find(o => o.id === ticket?.order_id);
      const customer = customers.find(c => c.id === order?.customer_id);
      const ticketMsgs = interactions.filter(i => i.ticket_id === ticket?.id);

      if (!ticket) return <div className="p-10 text-center">Ticket não encontrado.</div>;

      return (
        <TicketDetail 
          ticket={ticket}
          order={order || { store_name: 'Desconhecida', status: 'N/A' }}
          customer={customer || { name: 'Desconhecido', email: '-', avatar: '' }}
          interactions={ticketMsgs}
          onBack={() => {
            setSelectedTicketId(null);
            setCurrentView('inbox');
          }}
        />
      );
    }

    // TELA: ANALÍTICOS (Passa tickets e stores para os cálculos reais)
    if (currentView === 'analytics') {
      return <AnalyticsDashboard tickets={tickets} stores={stores} interactions={interactions} />;
    }

    // TELA: CÉREBRO DA IA
    if (currentView === 'automacao') {
      return <AutomationScreen />;
    }

    // TELA: GESTÃO DE LOJAS
    if (currentView === 'lojas') {
      return <StoreManager onUpdateCount={setStoreCount} />;
    }

    // TELA: INBOX (GESTÃO DE ATENDIMENTOS POR ABAS)
    if (currentView === 'inbox') {
      // 🚀 AQUI ESTÁ A CORREÇÃO: Passamos 'tickets' puro, sem filtro.
      // O componente TicketList cuidará de filtrar por status em cada aba.
      return (
        <TicketList 
          tickets={tickets} 
          onSelectTicket={(ticket) => handleOpenTicket(ticket.id)} 
        />
      );
    }
    
    return <div className="p-10 text-center text-slate-400">Página em construção...</div>;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Dinâmica */}
      {currentView !== 'ticket_detail' && (
        <Sidebar 
          user={user} 
          storeCount={storeCount}
          pendingCount={tickets.filter(t => t.status === 'PENDING_HUMAN').length}
          currentView={currentView}
          onNavigate={setCurrentView}
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;