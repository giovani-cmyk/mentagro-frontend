/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

export default function TicketList({ tickets, onSelectTicket }) {
  const [activeTab, setActiveTab] = useState('EM_ABERTO');

  // Lógica de Filtragem BLINDADA
  const getFilteredTickets = (tabId) => {
    
    // Função auxiliar para verificar status (normaliza texto para evitar erros)
    const checkStatus = (ticketStatus, targetStatusList) => {
      if (!ticketStatus) return false;
      return targetStatusList.includes(ticketStatus.toUpperCase());
    };

    // 1. ABA: EM ABERTO (Urgente)
    if (tabId === 'EM_ABERTO') {
      return tickets.filter(t => {
        // Se não tiver status, ou for um desses, cai aqui
        if (!t.status) return true;
        return checkStatus(t.status, ['PENDING_HUMAN', 'OPEN', 'NEW', 'URGENT']);
      });
    }

    // 2. ABA: CONCLUÍDO (Finalizado)
    if (tabId === 'CONCLUIDO') {
      return tickets.filter(t => {
        return checkStatus(t.status, ['RESOLVED', 'CLOSED', 'DONE', 'COMPLETED']);
      });
    }

    // 3. ABA: EM ESPERA (Todo o resto - Lógica "Pega-Tudo")
    if (tabId === 'EM_ESPERA') {
      return tickets.filter(t => {
        // Se já caiu nas regras de cima, ignoramos. Se não, cai aqui.
        const isOpen = checkStatus(t.status, ['PENDING_HUMAN', 'OPEN', 'NEW', 'URGENT']);
        const isDone = checkStatus(t.status, ['RESOLVED', 'CLOSED', 'DONE', 'COMPLETED']);
        
        // Se NÃO é aberto e NÃO é concluído, então é Espera (IN_PROGRESS, BOT_REPLIED, WAITING, etc)
        return !isOpen && !isDone; 
      });
    }
    return [];
  };

  const tabs = [
    { id: 'EM_ABERTO', label: 'Em Aberto', icon: 'assignment_late', color: 'text-red-500' },
    { id: 'EM_ESPERA', label: 'Em Espera', icon: 'hourglass_empty', color: 'text-amber-500' },
    { id: 'CONCLUIDO', label: 'Concluído', icon: 'task_alt', color: 'text-green-500' }
  ];

  const currentTickets = getFilteredTickets(activeTab);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Cabeçalho */}
      <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">view_day</span>
          Gestão de Atendimentos
        </h2>
      </div>

      {/* Abas */}
      <div className="bg-white px-8 border-b border-slate-200 flex gap-8 shrink-0">
        {tabs.map(tab => {
          const count = getFilteredTickets(tab.id).length;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-all ${
                isActive ? `border-blue-600 ${tab.color}` : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="w-full">
          {currentTickets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-start">
              {currentTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ticket.channel === 'email' ? 'bg-amber-400' : 'bg-blue-500'}`}></div>
                  
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`material-symbols-outlined text-sm shrink-0 ${ticket.channel === 'email' ? 'text-amber-500' : 'text-blue-500'}`}>
                        {ticket.channel === 'email' ? 'mail' : 'forum'}
                      </span>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {ticket.customer_name || 'Cliente'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 shrink-0">#{ticket.id.toString().slice(-4)}</span>
                  </div>

                  <p className="text-[10px] font-black text-blue-500/60 uppercase mb-3 truncate pl-2">{ticket.store_name}</p>

                  <div className="flex-1 pl-2">
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {ticket.channel === 'email' && ticket.subject && <strong className="text-slate-700 block mb-1">{ticket.subject}</strong>}
                      "{ticket.last_message || 'Clique para ver detalhes...'}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-50 pl-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span className="text-[10px] font-bold">
                        {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-200 group-hover:text-blue-600 transition-all">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <span className="material-symbols-outlined text-8xl mb-4">inbox</span>
              <h3 className="text-xl font-black uppercase tracking-[0.2em]">Tudo Limpo</h3>
              <p className="text-sm font-medium mt-2">Nenhum ticket nesta aba.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}