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
import StoreManager from './components/StoreManager'; // 1. Importação da nova Gestão de Lojas

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sincronização Global de Dados
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setLoading(true);
      
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: ordersData } = await supabase.from('orders').select('*');
      const { data: customersData } = await supabase.from('customers').select('*');
      const { data: interactionsData } = await supabase.from('interactions').select('*');

      if (ticketsData) setTickets(ticketsData);
      if (ordersData) setOrders(ordersData);
      if (customersData) setCustomers(customersData);
      if (interactionsData) setInteractions(interactionsData);
      
      setLoading(false);
    }

    fetchData();
  }, [user, currentView]);

  const handleOpenTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setCurrentView('ticket_detail');
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Roteador de Conteúdo
  const renderContent = () => {
    if (loading) {
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

    // TELA: ANALÍTICOS
    if (currentView === 'analytics') {
      return <AnalyticsDashboard tickets={tickets} />;
    }

    // TELA: CÉREBRO DA IA (CAMPOS VERDES + PERSONALIZADOS)
    if (currentView === 'automacao') {
      return <AutomationScreen />;
    }

    // TELA: INBOX (FILTRADA)
    if (currentView === 'inbox') {
      const inboxTickets = tickets.filter(t => t.status !== 'BOT_REPLIED');
      return (
        <TicketList 
          tickets={inboxTickets} 
          onSelectTicket={(ticket) => handleOpenTicket(ticket.id)} 
        />
      );
    }

    // 2. TELA: GESTÃO DE LOJAS (REAL)
    if (currentView === 'lojas') {
      return <StoreManager />;
    }
    
    return (
      <div className="p-10 text-slate-500 text-center font-sans">
        A rota "{currentView}" não possui um componente mapeado.
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Integrada */}
      {currentView !== 'ticket_detail' && (
        <Sidebar 
          user={user} 
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