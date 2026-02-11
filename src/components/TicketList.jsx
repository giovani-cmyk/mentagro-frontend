/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

export default function TicketList({ tickets, onSelectTicket }) {
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState('PENDING_HUMAN');

  // Definição das Abas seguindo sua lógica de status
  const tabs = [
    { id: 'PENDING_HUMAN', label: 'Em Aberto', icon: 'assignment_late', color: 'text-red-500', bgColor: 'bg-red-500' },
    { id: 'BOT_REPLIED', label: 'Em Espera', icon: 'hourglass_empty', color: 'text-amber-500', bgColor: 'bg-amber-500' },
    { id: 'RESOLVED', label: 'Concluído', icon: 'task_alt', color: 'text-green-500', bgColor: 'bg-green-500' }
  ];

  // Filtra os tickets baseado na aba selecionada
  const filteredTickets = tickets.filter(t => t.status === activeTab);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Cabeçalho Superior */}
      <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">view_day</span>
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

      {/* Navegação por ABAS */}
      <div className="bg-white px-8 border-b border-slate-200 flex gap-8 shrink-0">
        {tabs.map(tab => {
          const count = tickets.filter(t => t.status === tab.id).length;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-all relative ${
                isActive ? `border-blue-600 ${tab.color}` : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
              {count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {filteredTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Indicador de Canal (Lateral) */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ticket.channel === 'email' ? 'bg-amber-400' : 'bg-blue-500'}`}></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${ticket.channel === 'email' ? 'text-amber-500' : 'text-blue-500'}`}>
                        {ticket.channel === 'email' ? 'mail' : 'forum'}
                      </span>
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600">
                        {ticket.customer_name || 'Cliente'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                      #{ticket.id.toString().slice(-4)}
                    </span>
                  </div>

                  <p className="text-[10px] font-black text-blue-500/60 uppercase mb-3 tracking-widest">
                    {ticket.store_name}
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                    {ticket.channel === 'email' && ticket.subject ? <strong className="text-slate-700 block mb-1">{ticket.subject}</strong> : ''}
                    "{ticket.last_message || 'Clique para ver o histórico...'}"
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span className="text-[10px] font-bold">
                        {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                      arrow_forward_ios
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado Vazio (Tudo Limpo) */
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <span className="material-symbols-outlined text-8xl mb-4">inbox</span>
              <h3 className="text-xl font-black uppercase tracking-[0.2em]">Tudo Limpo</h3>
              <p className="text-sm font-medium">Nenhum atendimento nesta categoria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}