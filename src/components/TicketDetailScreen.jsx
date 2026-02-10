import React, { useState } from 'react';

export default function TicketDetailScreen({ ticket, order, customer, interactions, onBack, onResolve }) {
  const [reply, setReply] = useState('');

  return (
    <div className="flex h-full bg-slate-50">
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center gap-4">
          <button onClick={onBack}><span className="material-symbols-outlined">arrow_back</span></button>
          <div><h2 className="font-bold text-sm">{ticket.subject}</h2><p className="text-xs text-slate-500">#{ticket.id} • {order.store_name}</p></div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {interactions.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'CLIENT' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-xl max-w-[80%] text-sm ${msg.sender === 'CLIENT' ? 'bg-white border border-slate-200' : 'bg-blue-600 text-white'}`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2">
            <input value={reply} onChange={e => setReply(e.target.value)} className="flex-1 border rounded-lg p-2 text-sm" placeholder="Responder..." />
            <button onClick={() => onResolve(ticket.id, reply)} className="bg-blue-600 text-white px-4 rounded-lg font-bold text-sm">Enviar</button>
          </div>
        </div>
      </div>
      <aside className="w-80 bg-white border-l border-slate-200 p-6 hidden lg:block">
        <div className="text-center mb-6">
          <img src={customer.avatar} className="size-20 rounded-full mx-auto mb-2" />
          <h3 className="font-bold">{customer.name}</h3>
          <p className="text-xs text-slate-500">LTV: R$ {customer.ltv}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2">
          <p><strong>Pedido:</strong> #{order.id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Rastreio:</strong> {order.tracking_code}</p>
        </div>
      </aside>
    </div>
  );
}