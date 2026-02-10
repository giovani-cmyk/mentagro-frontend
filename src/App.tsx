/* eslint-disable */
// @ts-nocheck

import React, { useState } from 'react';
import { INITIAL_STATE } from './database';
import Sidebar from './components/Sidebar';
import InboxScreen from './components/InboxScreen';
import LoginScreen from './components/LoginScreen';
import TicketDetail from './components/TicketDetail'; // Importamos a tela de chat

function App() {
  const [db] = useState(INITIAL_STATE);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState(null); // Estado para guardar qual ticket foi clicado

  // 1. Função que processa o clique
  const handleOpenTicket = (ticketId) => {
    console.log("Ticket clicado:", ticketId); // Teste para ver se funciona
    setSelectedTicketId(ticketId);
    setCurrentView('ticket_detail');
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Lógica para decidir qual tela mostrar
  const renderContent = () => {
    // SE FOR TELA DE DETALHE
    if (currentView === 'ticket_detail' && selectedTicketId) {
      const ticket = db.tickets.find(t => t.id === selectedTicketId);
      const order = db.orders.find(o => o.id === ticket.order_id);
      const customer = db.customers.find(c => c.id === order.customer_id);
      const interactions = db.interactions.filter(i => i.ticket_id === ticket.id);

      return (
        <TicketDetail 
          ticket={ticket}
          order={order}
          customer={customer}
          interactions={interactions}
          onBack={() => {
            setSelectedTicketId(null);
            setCurrentView('inbox');
          }}
        />
      );
    }

    // SE FOR INBOX
    if (currentView === 'inbox') {
      return (
        <InboxScreen 
          tickets={db.tickets} 
          orders={db.orders} 
          customers={db.customers} 
          onOpenTicket={handleOpenTicket} // <--- AQUI ESTÁ O SEGREDO! Passamos a função para a tela.
        />
      );
    }

    // OUTRAS TELAS
    if (currentView === 'lojas') {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
           <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4">store</span>
              <h2 className="text-xl font-bold">Gestão de Lojas</h2>
           </div>
        </div>
      );
    }
    
    return <div className="p-10 text-slate-500">Em construção...</div>;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Esconde a Sidebar se estiver no chat para dar foco total */}
      {currentView !== 'ticket_detail' && (
        <Sidebar 
          user={user} 
          pendingCount={db.tickets.filter(t => t.status === 'PENDING_HUMAN').length}
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