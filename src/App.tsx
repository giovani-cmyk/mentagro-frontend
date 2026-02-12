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
  
  // Controle do MODAL (Popup)
  const [selectedTicketId, setSelectedTicketId] = useState(null); 
  
  // Estados Globais de Dados
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [stores, setStores] = useState([]); 
  const [storeCount, setStoreCount] = useState(0); 
  const [loading, setLoading] = useState(false);

  // Busca centralizada de todas as informações do banco
  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Busca todos os tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      // 2. Busca todas as lojas
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
  }, [user]); // Removi currentView da dependência para evitar recarregamento desnecessário ao trocar abas

  // FUNÇÃO PARA ABRIR O MODAL
  const handleOpenTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    // NÃO mudamos mais o currentView para manter a lista no fundo
  };

  // FUNÇÃO PARA FECHAR O MODAL
  const handleCloseTicket = () => {
    setSelectedTicketId(null);
    fetchAllData(); // Atualiza a lista ao fechar (para refletir mudança de status)
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // --- RENDERIZAÇÃO DO CONTEÚDO PRINCIPAL (LISTA/DASHBOARD) ---
  const renderContent = () => {
    if (loading && tickets.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-slate-400 gap-2 font-sans">
          <span className="material-symbols-outlined animate-spin text-blue-600">sync</span>
          Sincronizando OmniDesk AI...
        </div>
      );
    }

    if (currentView === 'analytics') {
      return <AnalyticsDashboard tickets={tickets} stores={stores} interactions={interactions} />;
    }

    if (currentView === 'automacao') {
      return <AutomationScreen />;
    }

    if (currentView === 'lojas') {
      return <StoreManager onUpdateCount={setStoreCount} />;
    }

    // Padrão: Inbox (Lista de Tickets)
    // Se estivermos vendo detalhes, a lista continua renderizada no fundo (por isso removemos o if antigo)
    return (
      <TicketList 
        tickets={tickets} 
        onSelectTicket={(ticket) => handleOpenTicket(ticket.id)} 
      />
    );
  };

  // --- PREPARAÇÃO DOS DADOS PARA O MODAL ---
  // Só calculamos isso se tiver um ticket selecionado para exibir no popup
  let selectedTicketData = null;
  if (selectedTicketId) {
    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (ticket) {
        const order = orders.find(o => o.id === ticket.order_id);
        const customer = customers.find(c => c.id === order?.customer_id);
        const ticketMsgs = interactions.filter(i => i.ticket_id === ticket.id);
        
        selectedTicketData = { ticket, order, customer, ticketMsgs };
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      {/* Sidebar Fixa (Agora aparece sempre) */}
      <Sidebar 
        user={user} 
        storeCount={storeCount}
        pendingCount={tickets.filter(t => t.status === 'PENDING_HUMAN').length}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* --- O MODAL (OVERLAY) FICA AQUI --- */}
      {/* Renderiza por cima de tudo se houver ticket selecionado */}
      {selectedTicketId && selectedTicketData && (
        <TicketDetail 
          ticket={selectedTicketData.ticket}
          order={selectedTicketData.order || { store_name: 'Desconhecida', status: 'N/A' }}
          customer={selectedTicketData.customer || { name: 'Desconhecido', email: '-', avatar: '' }}
          interactions={selectedTicketData.ticketMsgs}
          onClose={handleCloseTicket} // Passamos a função de fechar
        />
      )}
    </div>
  );
}

export default App;