/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function TicketList({ tickets, onSelectTicket }) {
  const [activeTab, setActiveTab] = useState('open'); // 'open', 'pending', 'closed'

  // Lógica de Filtro para as Abas baseada no status do banco
  const openTickets = tickets.filter(t => t.status === 'PENDING_HUMAN');
  const pendingTickets = tickets.filter(t => t.status === 'IN_PROGRESS');
  const closedTickets = tickets.filter(t => t.status === 'RESOLVED');

  let currentList = [];
  if (activeTab === 'open') currentList = openTickets;
  if (activeTab === 'pending') currentList = pendingTickets;
  if (activeTab === 'closed') currentList = closedTickets;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Transbordo Humano</h1>
        
        <div className="flex space-x-6 border-b border-slate-100">
          <button onClick={() => setActiveTab('open')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 ${activeTab === 'open' ? 'border-red-500 text-red-600' : 'text-slate-400'}`}>
            Em Aberto <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs">{openTickets.length}</span>
          </button>
          <button onClick={() => setActiveTab('pending')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 ${activeTab === 'pending' ? 'border-amber-500 text-amber-600' : 'text-slate-400'}`}>
            Em Espera <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs">{pendingTickets.length}</span>
          </button>
          <button onClick={() => setActiveTab('closed')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 ${activeTab === 'closed' ? 'border-green-500 text-green-600' : 'text-slate-400'}`}>
            Concluídos <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs">{closedTickets.length}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentList.map((ticket) => (
          <div key={ticket.id} onClick={() => onSelectTicket(ticket)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 cursor-pointer transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${ticket.priority === 'HIGH' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loja Fitness Oficial</span>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600">{ticket.subject}</h3>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500 truncate max-w-[400px]">🤖 Resposta do Bot: {ticket.bot_reply}</span>
              <button className="text-blue-600 text-sm font-bold">Ver Ticket →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}