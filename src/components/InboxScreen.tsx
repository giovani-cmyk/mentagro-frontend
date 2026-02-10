/* eslint-disable */
// @ts-nocheck
import React from 'react';

export default function InboxScreen({ tickets, orders, customers, onOpenTicket }) {
  return (
    <div className="flex-1 bg-slate-50 h-full overflow-hidden flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">inbox</span>
          Transbordo Humano
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{tickets.length} Pendentes</span>
        </h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition">
          <span className="material-symbols-outlined text-sm">refresh</span> Atualizar
        </button>
      </header>

      <div className="p-8 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th className="p-4 w-16 text-center">Pri</th>
                <th className="p-4">Loja de Origem</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Assunto do E-mail</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tickets.map(ticket => {
                const order = orders.find(o => o.id === ticket.order_id);
                const customer = customers.find(c => c.id === order?.customer_id);
                
                return (
                  <tr key={ticket.id} className="hover:bg-blue-50 transition cursor-pointer group">
                    <td className="p-4 text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto ${ticket.priority === 'HIGH' ? 'bg-red-500' : 'bg-yellow-400'}`} title={ticket.priority} />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700">{order?.store_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{order?.tracking}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={customer?.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                        <div>
                          <div className="font-bold text-slate-800">{customer?.name}</div>
                          <div className="text-xs text-slate-500">{customer?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium group-hover:text-blue-700">
                      {ticket.subject}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => onOpenTicket(ticket.id)}
                        className="text-blue-600 font-bold hover:underline flex items-center justify-end gap-1 ml-auto"
                      >
                        Ver Ticket <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}