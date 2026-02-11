/* eslint-disable */
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { supabase } from './services/api';
import Sidebar from './components/Sidebar';
import TicketList from './components/TicketList'; // Mudamos de InboxScreen para TicketList
import LoginScreen from './components/LoginScreen';
import TicketDetail from './components/TicketDetail';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 👇 MÁGICA ATUALIZADA: Busca dados incluindo novos campos
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setLoading(true);
      
      // Buscamos os tickets (removendo os que o BOT já resolveu sozinho)
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .neq('status', 'BOT_REPLIED') // Filtro para não poluir o transbordo humano
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
  }, [user, currentView]); // Recarrega quando volta para a inbox

  const handleOpenTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setCurrentView('ticket_detail');
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center text-slate-400 gap-2">
          <span className="material-symbols-outlined animate-spin">sync</span>
          Carregando dados reais...
        </div>
      );
    }

    // TELA DE DETALHE (CHAT)
    if (currentView === 'ticket_detail' && selectedTicketId) {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      const order = orders.find(o => o.id === ticket?.order_id);
      const customer = customers.find(c => c.id === order?.customer_id);
      const ticketMsgs = interactions.filter(i => i.ticket_id === ticket?.id);

      if (!ticket) return <div>Erro: Ticket não encontrado.</div>;

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

    // TELA DE LISTAGEM COM AS NOVAS ABAS
    if (currentView === 'inbox') {
      return (
        <TicketList 
          tickets={tickets} 
          onSelectTicket={(ticket) => handleOpenTicket(ticket.id)} 
        />
      );
    }

    // TELA DE LOJAS
    if (currentView === 'lojas') {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
           <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4">store</span>
              <h2 className="text-xl font-bold">Gestão de Lojas</h2>
              <p className="mt-2 text-sm">Conectado ao Supabase: <span className="text-green-500 font-bold">ONLINE</span></p>
           </div>
        </div>
      );
    }
    
    return <div className="p-10 text-slate-500">Em construção...</div>;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar só aparece se não estiver no detalhe do ticket */}
      {currentView !== 'ticket_detail' && (
        <Sidebar 
          user={user} 
          // O contador da sidebar foca apenas no que está REALMENTE aberto (PENDING_HUMAN)
          pendingCount={tickets.filter(t => t.status === 'PENDING_HUMAN').length}
          currentView={currentView}
          onNavigate={setCurrentView}
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;