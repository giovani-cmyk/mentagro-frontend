/* eslint-disable */
// @ts-nocheck
import React from 'react';

export default function TicketList({ tickets, onSelectTicket }) {
  // Filtramos os tickets para cada coluna baseada no status
  const columns = [
    {
      id: 'PENDING_HUMAN',
      title: 'Precisa de Você',
      icon: 'person_search',
      color: 'border-red-500',
      bgColor: 'bg-red-50/50',
      items: tickets.filter(t => t.status === 'PENDING_HUMAN')
    },
    {
      id: 'BOT_REPLIED',
      title: 'IA Respondeu',
      icon: 'smart_toy',
      color: 'border-green-500',
      bgColor: 'bg-green-50/50',
      items: tickets.filter(t => t.status === 'BOT_REPLIED')
    },
    {
      id: 'OPEN',
      title: 'Novos / Outros',
      icon: 'mail',
      color: 'border-blue-500',
      bgColor: 'bg-blue-50/50',
      items: tickets.filter(t => t.status !== 'PENDING_HUMAN' && t.status !== 'BOT_REPLIED')
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Cabeçalho */}
      <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">view_kanban</span>
          Fluxo de Atendimento Multicanal
        </h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Chat
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span> E-mail
          </div>
        </div>
      </div>

      {/* Grid de 3 Colunas */}
      <div className="flex-1 flex gap-6 p-6 overflow-x-auto overflow-y-hidden h-full">
        {columns.map(col => (
          <div key={col.id} className={`flex-1 min-w-[350px] flex flex-col rounded-3xl ${col.bgColor} border border-slate-100`}>
            {/* Título da Coluna */}
            <div className={`p-5 border-b-2 ${col.color} flex justify-between items-center bg-white rounded-t-3xl`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">{col.icon}</span>
                <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">{col.title}</h3>
              </div>
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-black">
                {col.items.length}
              </span>
            </div>

            {/* Lista de Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {col.items.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.channel === 'email' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        <span className="material-symbols-outlined text-sm">
                          {ticket.channel === 'email' ? 'mail' : 'forum'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {ticket.customer_name || 'Cliente'}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{ticket.store_name}</p>
                      </div>
                    </div>
                  </div>

                  {ticket.channel === 'email' && ticket.subject && (
                    <p className="text-xs font-bold text-slate-600 mb-1 truncate">
                      {ticket.subject}
                    </p>
                  )}
                  
                  <p className="text-xs text-slate-500 line-clamp-2 italic mb-4">
                    "{ticket.last_message || 'Sem conteúdo...'}"
                  </p>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">
                      Abrir conversa →
                    </button>
                  </div>
                </div>
              ))}

              {col.items.length === 0 && (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs italic">
                  Vazio
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}