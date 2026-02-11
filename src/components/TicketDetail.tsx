/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function TicketList({ onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('open'); // 'open', 'pending', 'closed'
  const [loading, setLoading] = useState(true);

  // 1. Busca os tickets no Supabase ao carregar
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Buscamos tudo que NÃO foi resolvido pelo robô (BOT_REPLIED)
      // Também fazemos o "join" para pegar o nome da loja na tabela orders
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          orders (
            store_name
          )
        `)
        .neq('status', 'BOT_REPLIED') // Esconde os resolvidos por robô
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lógica de Filtro para as Abas
  const openTickets = tickets.filter(t => t.status === 'PENDING_HUMAN');
  const pendingTickets = tickets.filter(t => t.status === 'IN_PROGRESS');
  const closedTickets = tickets.filter(t => t.status === 'RESOLVED');

  // Decide qual lista mostrar baseada na aba
  let currentList = [];
  if (activeTab === 'open') currentList = openTickets;
  if (activeTab === 'pending') currentList = pendingTickets;
  if (activeTab === 'closed') currentList = closedTickets;

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando tickets...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Cabeçalho da Lista */}
      <div className="p-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Transbordo Humano</h1>
        
        {/* ABAS DE NAVEGAÇÃO */}
        <div className="flex space-x-6 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('open')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'open' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Em Aberto
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'open' ? 'bg-red-100' : 'bg-slate-100'}`}>
              {openTickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'pending' 
                ? 'border-amber-500 text-amber-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Em Espera
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-amber-100' : 'bg-slate-100'}`}>
              {pendingTickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('closed')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'closed' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Concluídos
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'closed' ? 'bg-green-100' : 'bg-slate-100'}`}>
              {closedTickets.length}
            </span>
          </button>
        </div>
      </div>

      {/* LISTAGEM DOS CARDS */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
            <p>Nenhum ticket nesta aba.</p>
          </div>
        ) : (
          currentList.map((ticket) => (
            <div 
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)} // Chama a função para abrir o TicketDetail
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {/* Bolinha de Prioridade */}
                  <div className={`w-2.5 h-2.5 rounded-full ${ticket.priority === 'HIGH' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {ticket.orders?.store_name || 'Loja Desconhecida'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                {ticket.subject}
              </h3>
              
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-slate-500 truncate max-w-[300px]">
                  {/* Mostra um trecho da resposta do bot se existir, senão mostra ID */}
                  {ticket.bot_reply ? `🤖 Bot: ${ticket.bot_reply}` : `ID: ${ticket.id}`}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Ícone de Sentimento (Opcional se você já tiver no banco) */}
                  {ticket.sentiment === 'NEGATIVE' && <span title="Cliente Bravo" className="text-lg">😡</span>}
                  
                  <button className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver Ticket <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}