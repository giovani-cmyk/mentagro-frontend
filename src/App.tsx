/* eslint-disable */
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase'; // Importando a conexão real
import Sidebar from './components/Sidebar';
import InboxScreen from './components/InboxScreen';
import LoginScreen from './components/LoginScreen';
import TicketDetail from './components/TicketDetail';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  // Estados para guardar os dados REAIS do banco
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 👇 A MÁGICA: Buscar dados do Supabase ao carregar
  useEffect(() => {
    async function fetchData() {
      if (!user) return; // Só busca se estiver logado

      setLoading(true);
      console.log("Buscando dados do Supabase...");

      // 1. Buscar Tickets
      const { data: ticketsData, error: errorT } = await supabase.from('tickets').select('*');
      if (errorT) console.error("Erro Tickets:", errorT);
      
      // 2. Buscar Pedidos
      const { data: ordersData } = await supabase.from('orders').select('*');
      
      // 3. Buscar Clientes
      const { data: customersData } = await supabase.from('customers').select('*');

      // 4. Buscar Interações
      const { data: interactionsData } = await supabase.from('interactions').select('*');

      if (ticketsData) setTickets(ticketsData);
      if (ordersData) setOrders(ordersData);
      if (customersData) setCustomers(customersData);
      if (interactionsData) setInteractions(interactionsData);
      
      setLoading(false);
    }

    fetchData();
  }, [user]); // Roda toda vez que o usuário loga

  // Função do clique
  const handleOpenTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setCurrentView('ticket_detail');
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Renderização
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center text-slate-400 gap-2">
          <span className="material-symbols-outlined animate-spin">sync</span>
          Carregando dados reais...
        </div>
      );
    }

    if (currentView === 'ticket_detail' && selectedTicketId) {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      const order = orders.find(o => o.id === ticket?.order_id);
      const customer = customers.find(c => c.id === order?.customer_id);
      
      // Filtra mensagens deste ticket
      const ticketMsgs = interactions.filter(i => i.ticket_id === ticket.id);

      // Se algo estiver faltando (segurança)
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

    if (currentView === 'inbox') {
      return (
        <InboxScreen 
          tickets={tickets} 
          orders={orders} 
          customers={customers} 
          onOpenTicket={handleOpenTicket} 
        />
      );
    }

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
      {currentView !== 'ticket_detail' && (
        <Sidebar 
          user={user} 
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