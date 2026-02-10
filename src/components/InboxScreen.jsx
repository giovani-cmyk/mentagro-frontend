import React from 'react';

export default function InboxScreen({ title, tickets, orders, customers, onSelectTicket, onToggleSidebar }) {
  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      <header className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden text-slate-500"><span className="material-symbols-outlined">menu</span></button>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">{title} <span className="text-sm bg-blue-100 text-blue-700 px-2 rounded-full">{tickets.length}</span></h1>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
            <tr><th className="p-3">Pri</th><th className="p-3">Loja</th><th className="p-3">Cliente</th><th className="p-3">Assunto</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map(t => {
              const order = orders.find(o => o.id === t.order_id);
              const customer = customers.find(c => c.id === order?.customer_id);
              return (
                <tr key={t.id} onClick={() => onSelectTicket(t.id)} className="hover:bg-blue-50 cursor-pointer">
                  <td className="p-3"><div className={`size-3 rounded-full ${t.priority === 'HIGH' ? 'bg-red-500' : 'bg-yellow-400'}`} /></td>
                  <td className="p-3 font-bold text-xs">{order?.store_name}</td>
                  <td className="p-3 text-xs flex items-center gap-2"><img src={customer?.avatar} className="size-6 rounded-full"/> {customer?.name}</td>
                  <td className="p-3 text-xs font-medium">{t.subject}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}