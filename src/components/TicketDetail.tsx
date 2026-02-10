/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

export default function TicketDetail({ ticket, order, customer, interactions, onBack }) {
  const [reply, setReply] = useState('');

  // Identifica o sentimento para mostrar um ícone
  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'ANGRY') return 'sentiment_very_dissatisfied';
    if (sentiment === 'POSITIVE') return 'sentiment_satisfied';
    return 'sentiment_neutral';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* ÁREA DE CHAT (CENTRO) */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-200">
        
        {/* Header do Chat */}
        <header className="h-16 border-b border-slate-200 flex items-center px-6 gap-4 bg-white shrink-0">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              {ticket.subject}
              <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{ticket.priority}</span>
            </h2>
            <p className="text-xs text-slate-500">Ticket #{ticket.id} • Via E-mail</p>
          </div>
        </header>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {interactions.map((msg) => {
            const isClient = msg.sender === 'CLIENT';
            const isSystem = msg.sender === 'SYSTEM';
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                  isClient 
                    ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200' 
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  <div className="text-[10px] font-bold opacity-70 mb-1 uppercase">
                    {isClient ? customer.name : (msg.sender === 'AI' ? 'Gemini AI' : 'Você')}
                  </div>
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>

        {/* Área de Resposta */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <textarea 
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escreva sua resposta ou aprove a sugestão da IA..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm p-2 resize-none h-20 outline-none text-slate-700 placeholder:text-slate-400"
            />
            <div className="flex justify-between items-center px-2 pb-1">
              <div className="flex gap-2 text-slate-400">
                <button className="hover:text-blue-600"><span className="material-symbols-outlined text-xl">attach_file</span></button>
                <button className="hover:text-blue-600"><span className="material-symbols-outlined text-xl">smart_toy</span></button>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2">
                Enviar Resposta <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA LATERAL DE CONTEXTO (DIREITA) */}
      <aside className="w-80 bg-white p-6 overflow-y-auto hidden lg:block">
        
        {/* Cartão do Cliente */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img src={customer.avatar} className="w-20 h-20 rounded-full border-4 border-slate-50 mb-3 mx-auto" />
            <span className="absolute bottom-2 right-0 bg-white p-1 rounded-full shadow-sm border border-slate-100" title={customer.sentiment}>
              <span className={`material-symbols-outlined text-sm ${customer.sentiment === 'ANGRY' ? 'text-red-500' : 'text-green-500'}`}>
                {getSentimentIcon(customer.sentiment)}
              </span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">{customer.name}</h3>
          <p className="text-sm text-slate-500">{customer.email}</p>
        </div>

        {/* Dados do Pedido */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Detalhes do Pedido</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Loja:</span>
                <span className="font-medium text-slate-800">{order.store_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ID:</span>
                <span className="font-medium text-slate-800">#{order.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.status === 'ATRASADO' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {order.status}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-slate-500 mb-1">Rastreio:</p>
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded text-xs font-mono">
                  <span className="material-symbols-outlined text-sm text-slate-400">local_shipping</span>
                  {order.tracking}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Sugestão da IA</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              O cliente parece frustrado com o atraso. Recomendo pedir desculpas formais e oferecer um cupom de 5% de desconto para a próxima compra como compensação.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}