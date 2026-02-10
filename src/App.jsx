import React, { useState } from 'react';
import { INITIAL_STATE } from './mockdata';
import Sidebar from './components/Sidebar';
import InboxScreen from './components/InboxScreen';
import TicketDetailScreen from './components/TicketDetailScreen';
import LoginScreen from './components/LoginScreen';

function App() {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(INITIAL_STATE);
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedTicket = db.tickets.find(t => t.id === selectedTicketId);

  if (!user) return <LoginScreen onLogin={setUser} />;

  const handleResolve = (id, msg) => {
    setDb(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t),
      interactions: [...prev.interactions, { id: Date.now(), ticket_id: id, sender: 'AGENT', message: msg }]
    }));
    setCurrentView('inbox');
    setSelectedTicketId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        user={user} 
        pendingCount={db.tickets.filter(t => t.status === 'PENDING_HUMAN').length}
        currentView={currentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(v) => { setCurrentView(v); setSelectedTicketId(null); setIsSidebarOpen(false); }}
        onLogout={() => setUser(null)}
      />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {currentView === 'inbox' && (
          <InboxScreen 
            title="Transbordo IA" 
            tickets={db.tickets.filter(t => t.status === 'PENDING_HUMAN')} 
            orders={db.orders} 
            customers={db.customers}
            onSelectTicket={(id) => { setSelectedTicketId(id); setCurrentView('detail'); }}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
        )}
        {currentView === 'detail' && selectedTicket && (
          <TicketDetailScreen 
            ticket={selectedTicket}
            order={db.orders.find(o => o.id === selectedTicket.order_id)}
            customer={db.customers.find(c => c.id === db.orders.find(o => o.id === selectedTicket.order_id).customer_id)}
            interactions={db.interactions.filter(i => i.ticket_id === selectedTicket.id)}
            onBack={() => setCurrentView('inbox')}
            onResolve={handleResolve}
          />
        )}
      </main>
    </div>
  );
}

export default App;