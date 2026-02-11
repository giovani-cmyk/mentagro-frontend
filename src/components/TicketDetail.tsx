/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { supabase } from '../services/api';

export default function TicketDetail({ ticket, order, customer, interactions, onBack }) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [localInteractions, setLocalInteractions] = useState(interactions);
  
  // NOVO: Estado para controlar o status localmente
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // FUNÇÃO PARA ATUALIZAR STATUS MANUALMENTE
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;
      setCurrentStatus(newStatus); // Atualiza a cor na hora
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    
    const newMessage = {
      ticket_id: ticket.id,
      sender: 'Suporte Mentagro',
      message: reply,
    };

    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert([newMessage])
        .select();

      if (error) throw error;

      setLocalInteractions([...localInteractions, data[0]]);
      setReply('');
      
      // DICA: Se o humano respondeu, podemos mover automaticamente para "Em Espera"
      if (currentStatus === 'PENDING_HUMAN') {
        handleUpdateStatus('IN_PROGRESS');
      }
    } catch (err) {
      alert('Erro ao enviar mensagem: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header do Ticket */}
      <div className="border-b border-slate-200 p-4 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{ticket.subject}</h2>
            <p className="text-xs text-slate-500">ID: {ticket.id} • Loja: {order?.store_name}</p>
          </div>
        </div>

        {/* SELETOR DE STATUS MANUAL */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
          <select 
            value={currentStatus}
            disabled={updatingStatus}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer outline-none shadow-sm transition-all ${
              currentStatus === 'PENDING_HUMAN' ? 'bg-red-100 text-red-600' : 
              currentStatus === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-600' : 
              'bg-green-100 text-green-600'
            }`}
          >
            <option value="PENDING_HUMAN">🔴 Em Aberto</option>
            <option value="IN_PROGRESS">🟡 Em Espera</option>
            <option value="RESOLVED">🟢 Concluído</option>
          </select>
          
          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600`}>
            {ticket.priority}
          </span>
        </div>
      </div>

      {/* ... Resto do seu código de chat (mantém igual) ... */}
      <div className="flex-1 flex overflow-hidden">
         {/* Lado Esquerdo: Chat (seu código original aqui) */}
         <div className="flex-1 flex flex-col border-r border-slate-200">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {localInteractions.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'Suporte Mentagro' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'Suporte Mentagro' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}>
                  <p className="text-xs font-bold mb-1 opacity-70">{msg.sender}</p>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="relative">
              <textarea 
                rows="3"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Digite sua resposta aqui..."
                className="w-full border border-slate-200 rounded-xl p-4 pr-16 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              />
              <button 
                onClick={handleSendReply}
                disabled={sending || !reply.trim()}
                className="absolute right-3 bottom-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
              >
                {sending ? <span className="material-symbols-outlined animate-spin text-xl">sync</span> : <span className="material-symbols-outlined text-xl">send</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Info (seu código original aqui) */}
        <div className="w-80 overflow-y-auto p-6 bg-white space-y-8">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Cliente</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-400">{customer?.name?.charAt(0)}</div>
              <div>
                <p className="font-bold text-slate-800">{customer?.name}</p>
                <p className="text-xs text-slate-500">{customer?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}