/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from './services/api';
import Sidebar from './components/Sidebar';
import TicketList from './components/TicketList';
import LoginScreen from './components/LoginScreen';
import TicketDetail from './components/TicketDetail';
import AnalyticsDashboard from './components/AnalyticsDashboard'; // Importação confirmada

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca global de dados do Supabase
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setLoading(true);
      
      // Buscamos todos os tickets para alimentar o Analytics e a Inbox
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

  // Lógica de Renderização de Telas
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center text-slate-400 gap-2">
          <span className="material-symbols-outlined animate-spin">sync</span>
          Carregando dados reais...
        </div>
      );
    }

    // 1. TELA: DETALHE DO TICKET (CHAT)
    if (currentView === 'ticket_detail' && selectedTicketId) {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      const order = orders.find(o => o.id === ticket?.order_id);
      const customer = customers.find(c => c.id === order?.customer_id);
      const ticketMsgs = interactions.filter(i => i.ticket_id === ticket?.id);

      if (!ticket) return <div className="p-10 text-center text-slate-500">Ticket não encontrado.</div>;

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

    // 2. TELA: ANALÍTICOS (Sincronizado com ID 'analytics' da Sidebar)
    if (currentView === 'analytics') {
      return <AnalyticsDashboard tickets={tickets} />;
    }

    // 3. TELA: AUTOMAÇÃO & IA (Sincronizado com ID 'automacao' da Sidebar)
    if (currentView === 'automacao') {
      return (
        <div className="p-8 bg-slate-50 h-full overflow-y-auto text-slate-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">smart_toy</span>
              Configurações de IA
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-4">Status do Robô</h3>
                <div className="flex items-center gap-3 text-green-600 font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  IA Operacional no Shopify
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-4">Base de Conhecimento</h3>
                <p className="text-sm text-slate-500 mb-4">O robô utiliza as regras de negócio definidas no n8n.</p>
                <button className="text-blue-600 font-bold text-sm hover:underline">Ver Instruções Atuais →</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. TELA: TRANSBORDO INBOX (Sincronizado com ID 'inbox')
    if (currentView === 'inbox') {
      // Filtra para o humano não ver o que o bot já resolveu sozinho
      const inboxTickets = tickets.filter(t => t.status !== 'BOT_REPLIED');
      return (
        <TicketList 
          tickets={inboxTickets} 
          onSelectTicket={(ticket) => handleOpenTicket(ticket.id)} 
        />
      );
    }

    // 5. TELA: GESTÃO DE LOJAS (Sincronizado com ID 'lojas')
    if (currentView === 'lojas') {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
           <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">store</span>
              <h2 className="text-xl font-bold text-slate-700">Gestão de Lojas (50)</h2>
              <p className="mt-2 text-sm italic">Conexão com bancos de dados: <span className="text-green-500 font-bold">ATIVA</span></p>
           </div>
        </div>
      );
    }
    
    // FALLBACK: Rota de segurança
    return (
      <div className="p-10 text-slate-500 text-center">
        A rota "{currentView}" ainda não foi configurada no renderContent.
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar - Fixa o ID de acordo com Sidebar.tsx */}
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