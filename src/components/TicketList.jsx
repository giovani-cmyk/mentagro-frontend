/* eslint-disable */
// @ts-nocheck
import React from 'react';

export default function TicketList({ tickets, onSelectTicket }) {
  // Função para formatar a data de forma amigável
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cores dinâmicas para os status
  const statusConfig = {
    'PENDING_HUMAN': 'bg-red-100 text-red-600 border-red-200',
    'BOT_REPLIED': 'bg-green-100 text-green-600 border-green-200',
    'OPEN': 'bg-blue-100 text-blue-600 border-blue-200'
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Cabeçalho da Lista */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">inbox</span>
          Transbordo de Mensagens
        </h2>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {tickets.length} Atendimentos
        </div>
      </div>

      {/* Tabela de Tickets */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
              <th className="px-8 py-4">Canal / Cliente</th>
              <th className="px-8 py-4">Assunto / Última Mensagem</th>
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                onClick={() => onSelectTicket(ticket)}
                className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
              >
                {/* Canal e Nome do Cliente */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ticket.channel === 'email' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      <span className="material-symbols-outlined text-xl">
                        {ticket.channel === 'email' ? 'mail' : 'forum'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {ticket.customer_name || 'Cliente OminiDesk'}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {ticket.store_name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Conteúdo da Mensagem ou Assunto */}
                <td className="px-8 py-5">
                  <div className="max-w-md">
                    <p className="text-sm font-bold text-slate-700 truncate mb-0.5">
                      {ticket.channel === 'email' ? (ticket.subject || '(Sem Assunto)') : 'Conversa via Chat'}
                    </p>
                    <p className="text-xs text-slate-500 truncate italic">
                      {ticket.last_message || 'Clique para ver o histórico...'}
                    </p>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-8 py-5">
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${statusConfig[ticket.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {ticket.status === 'PENDING_HUMAN' ? 'PRECISA DE VOCÊ' : 'IA RESPONDEU'}
                    </span>
                  </div>
                </td>

                {/* Data */}
                <td className="px-8 py-5 text-right">
                  <p className="text-xs font-bold text-slate-400">
                    {formatDate(ticket.created_at)}
                  </p>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="4" className="py-20 text-center text-slate-400 italic">
                  Nenhuma mensagem pendente no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}