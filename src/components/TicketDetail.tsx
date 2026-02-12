/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { supabase } from '../services/api';

export default function TicketDetail({ ticket, order, customer, interactions, onClose }) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [localInteractions, setLocalInteractions] = useState(interactions || []);
  
  // Estado para controlar o status localmente
  const [currentStatus, setCurrentStatus] = useState(ticket.status || 'OPEN');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // --- CORES DOS STATUS ---
  const getStatusStyle = (status) => {
    const s = status ? status.toUpperCase() : '';
    if (['PENDING_HUMAN', 'OPEN', 'URGENT'].includes(s)) return 'bg-red-100 text-red-600';
    if (['IN_PROGRESS', 'WAITING', 'BOT_REPLIED'].includes(s)) return 'bg-amber-100 text-amber-600';
    if (['RESOLVED', 'CLOSED', 'DONE'].includes(s)) return 'bg-green-100 text-green-600';
    return 'bg-slate-100 text-slate-600'; 
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;
      setCurrentStatus(newStatus); 
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
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert([newMessage])
        .select();

      if (error) throw error;

      setLocalInteractions([...localInteractions, data[0]]);
      setReply('');
      
      if (['PENDING_HUMAN', 'OPEN'].includes(currentStatus)) {
        handleUpdateStatus('IN_PROGRESS');
      }
    } catch (err) {
      alert('Erro ao enviar mensagem: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // --- AQUI COMEÇA A MÁGICA DO MODAL ---
  return (
    // 1. Fundo Escuro (Overlay) que cobre a tela toda
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* 2. A Caixa do Modal (Card Branco) */}
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
        
        {/* Botão de Fechar (X) Absoluto */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all z-20 shadow-sm border border-slate-100"
          title="Fechar Janela"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* --- CABEÇALHO DO TICKET --- */}
        <div className="border-b border-slate-200 p-5 flex items-center justify-between bg-slate-50 shrink-0 pr-16">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-blue-600">confirmation_number</span>
                <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{ticket.subject || 'Sem Assunto'}</h2>
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-500 pl-8">
               <span className="font-mono bg-slate-200 px-1.5 rounded text-slate-600">ID: #{ticket.id}</span>
               <span>•</span>
               <span>{order?.store_name || 'Loja Desconhecida'}</span>
             </div>
          </div>

          <select 
              value={currentStatus}
              disabled={updatingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border-none cursor-pointer outline-none shadow-sm transition-all appearance-none text-center min-w-[140px] ${getStatusStyle(currentStatus)}`}
            >
              <option value="OPEN">🔴 Novo (Open)</option>
              <option value="PENDING_HUMAN">🔴 Transbordo</option>
              <option value="IN_PROGRESS">🟡 Em Atendimento</option>
              <option value="WAITING">🟡 Aguardando Cliente</option>
              <option value="RESOLVED">🟢 Resolvido</option>
              <option value="CLOSED">🟢 Fechado</option>
            </select>
        </div>

        {/* --- CORPO (DIVIDIDO EM DUAS COLUNAS) --- */}
        <div className="flex-1 flex overflow-hidden">
           
           {/* ESQUERDA: CHAT */}
           <div className="flex-1 flex flex-col border-r border-slate-200 relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              
              {/* BLOCO DO N8N (RESUMO) */}
              {ticket.messages && (
                <div className="flex justify-center mb-8">
                  <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl max-w-[90%] w-full shadow-sm">
                    <div className="flex items-center gap-2 mb-3 border-b border-yellow-100 pb-2">
                      <span className="material-symbols-outlined text-yellow-600">smart_toy</span>
                      <strong className="text-xs font-black text-yellow-700 uppercase tracking-widest">
                        Registro Automático (IA + Cliente)
                      </strong>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {ticket.messages}
                    </div>
                  </div>
                </div>
              )}

              {/* MENSAGENS DO CHAT */}
              {localInteractions.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'Suporte Mentagro' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm transition-all ${
                    msg.sender === 'Suporte Mentagro' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}>
                    <p className="text-[10px] font-black mb-1 opacity-70 uppercase tracking-wider">{msg.sender}</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-[10px] mt-2 opacity-50 text-right">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Agora'}
                    </p>
                  </div>
                </div>
              ))}
              <div className="h-4"></div>
            </div>

            {/* INPUT DE RESPOSTA */}
            <div className="p-5 border-t border-slate-200 bg-white z-10">
              <div className="relative shadow-sm rounded-xl">
                <textarea 
                  rows="3"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="w-full border border-slate-200 rounded-xl p-4 pr-16 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all bg-slate-50 focus:bg-white"
                />
                <button 
                  onClick={handleSendReply}
                  disabled={sending || !reply.trim()}
                  className="absolute right-3 bottom-3 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
                >
                  <span className="material-symbols-outlined text-xl">send</span>
                </button>
              </div>
            </div>
          </div>

          {/* DIREITA: INFO LATERAL (Apenas visível em telas grandes) */}
          <div className="w-80 overflow-y-auto bg-white hidden lg:block p-6 space-y-8">
              {/* DADOS DO CLIENTE */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Cliente
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-xl font-bold text-blue-500 border border-blue-100">
                    {(customer?.name || ticket.customer_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 truncate">{customer?.name || ticket.customer_name || 'Nome não registrado'}</p>
                    <p className="text-xs text-slate-500 truncate">{customer?.email || ticket.customer_email || 'E-mail não registrado'}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              {/* DADOS DO PEDIDO */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  Pedido Vinculado
                </h3>
                
                {order ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-700">#{order.order_number || ticket.order_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.financial_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {order.financial_status === 'paid' ? 'Pago' : order.financial_status || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-3">
                      <span className="text-slate-500">Total:</span>
                      <span className="font-bold text-slate-800">R$ {order.total_price || '0,00'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">remove_shopping_cart</span>
                    <p className="text-xs text-slate-400 font-medium">Sem pedido vinculado.</p>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}