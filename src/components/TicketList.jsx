/* eslint-disable */
// @ts-nocheck
import React from 'react';

export default function TicketList({ tickets, onSelectTicket }) {
  // Configuração das 3 colunas baseada na sua nova estrutura
  const columns = [
    {
      id: 'OPEN',
      title: 'Em Aberto',
      icon: 'assignment_late',
      color: 'border-red-500',
      bgColor: 'bg-red-50/40',
      status: 'PENDING_HUMAN' // Prioridade para o que precisa de você
    },
    {
      id: 'WAITING',
      title: 'Em Espera',
      icon: 'hourglass_empty',
      color: 'border-amber-500',
      bgColor: 'bg-amber-50/40',
      status: 'BOT_REPLIED' // IA respondeu e está aguardando o cliente
    },
    {
      id: 'DONE',
      title: 'Concluído',
      icon: 'task_alt',
      color: 'border-green-500',
      bgColor: 'bg-green-50/40',
      status: 'RESOLVED' // Atendimentos finalizados
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Cabeçalho Minimalista */}
      <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">view_kanban</span>
          Gestão de Atendimentos
        </h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
             <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Chat
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
             <span className="w-2 h-2 bg-amber-500 rounded-full"></span> E-mail
          </div>
        </div>
      </div>

      {/* Grid de 3 Colunas Kanban */}
      <div className="flex-1 flex gap-6 p-6 overflow-x-auto h-full items-start">
        {columns.map(col => {
          const colItems = tickets.filter(t => t.status === col.status);
          
          return (
            <div key={col.id} className={`flex-1 min-w-[320px] max-w-[400px] flex flex-col rounded-3xl ${col.bgColor} border border-slate-100 max-h-full shadow-sm`}>
              {/* Header da Coluna */}
              <div className={`p-4 border-b-2 ${col.color} flex justify-between items-center bg-white rounded-t-3xl`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-sm">{col.icon}</span>
                  <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{col.title}</h3>
                </div>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {colItems.length}
                </span>
              </div>

              {/* Scroll de Cards */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {colItems.map(ticket => (
                  <div 
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    {/* Indicador lateral discreto de Canal */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${ticket.channel === 'email' ? 'bg-amber-400' : 'bg-blue-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${ticket.channel === 'email' ? 'text-amber-500' : 'text-blue-500'}`}>
                          {ticket.channel === 'email' ? 'mail' : 'forum'}
                        </span>
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600">
                          {ticket.customer_name || 'Cliente'}
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">
                      {ticket.store_name}
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed italic">
                      {ticket.channel === 'email' && ticket.subject ? `[${ticket.subject}] ` : ''}
                      "{ticket.last_message || 'Clique para ver detalhes...'}"
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="material-symbols-outlined text-slate-300 text-sm group-hover:text-blue-600 transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center opacity-30">
                    <span className="material-symbols-outlined text-3xl mb-1">inbox</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-center">Tudo Limpo</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}