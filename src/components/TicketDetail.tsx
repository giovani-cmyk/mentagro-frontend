/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { supabase } from '../services/api';

export default function TicketDetail({ ticket, order, customer, interactions, onBack }) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [localInteractions, setLocalInteractions] = useState(interactions || []);
  
  // Estado para controlar o status localmente e visualmente
  const [currentStatus, setCurrentStatus] = useState(ticket.status || 'OPEN');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // --- LÓGICA DE CORES DOS STATUS ---
  // Função auxiliar para decidir a cor do badge baseado no texto
  const getStatusStyle = (status) => {
    const s = status ? status.toUpperCase() : '';
    if (['PENDING_HUMAN', 'OPEN', 'URGENT'].includes(s)) return 'bg-red-100 text-red-600';
    if (['IN_PROGRESS', 'WAITING', 'BOT_REPLIED'].includes(s)) return 'bg-amber-100 text-amber-600';
    if (['RESOLVED', 'CLOSED', 'DONE'].includes(s)) return 'bg-green-100 text-green-600';
    return 'bg-slate-100 text-slate-600'; // Cor padrão
  };

  // FUNÇÃO PARA ATUALIZAR STATUS MANUALMENTE NO SUPABASE
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;
      setCurrentStatus(newStatus); // Atualiza a cor na hora sem recarregar
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // FUNÇÃO PARA ENVIAR RESPOSTA HUMANA
  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    
    const newMessage = {
      ticket_id: ticket.id,
      sender: 'Suporte Mentagro', // Ou user.name se tiver autenticação
      message: reply,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert([newMessage])
        .select();

      if (error) throw error;

      // Adiciona a mensagem na lista local para aparecer instantaneamente
      setLocalInteractions([...localInteractions, data[0]]);
      setReply('');
      
      // AUTOMACAO: Se status for "Aberto", move para "Em Espera" ao responder
      if (['PENDING_HUMAN', 'OPEN'].includes(currentStatus)) {
        handleUpdateStatus('IN_PROGRESS');
      }
    } catch (err) {
      alert('Erro ao enviar mensagem: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* --- CABEÇALHO DO TICKET --- */}
      <div className="border-b border-slate-200 p-4 flex items-center justify-between bg-slate-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors group">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 line-clamp-1">{ticket.subject || 'Sem Assunto'}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono bg-slate-200 px-1.5 rounded">#{ticket.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">store</span>
                {order?.store_name || 'Loja Desconhecida'}
              </span>
            </div>
          </div>
        </div>

        {/* --- SELETOR DE STATUS --- */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Status Atual</span>
            <select 
              value={currentStatus}
              disabled={updatingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer outline-none shadow-sm transition-all appearance-none text-center min-w-[120px] ${getStatusStyle(currentStatus)}`}
            >
              <option value="OPEN">🔴 Novo (Open)</option>
              <option value="PENDING_HUMAN">🔴 Transbordo</option>
              <option value="IN_PROGRESS">🟡 Em Atendimento</option>
              <option value="WAITING">🟡 Aguardando Cliente</option>
              <option value="RESOLVED">🟢 Resolvido</option>
              <option value="CLOSED">🟢 Fechado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* --- ÁREA DE CHAT (ESQUERDA) --- */}
         <div className="flex-1 flex flex-col border-r border-slate-200 relative">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            
            {/* === BLOCO DO N8N (IMPORTANTE) === 
                Aqui mostramos o histórico inicial que veio do n8n (messages) 
            */}
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

            {/* MENSAGENS HUMANAS (INTERAÇÕES) */}
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
            
            {/* Espaço vazio no final para não esconder o último balão */}
            <div className="h-4"></div>
          </div>

          {/* ÁREA DE INPUT DE RESPOSTA */}
          <div className="p-4 border-t border-slate-200 bg-white z-10">
            <div className="relative shadow-sm rounded-xl">
              <textarea 
                rows="3"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Digite sua resposta para o cliente..."
                className="w-full border border-slate-200 rounded-xl p-4 pr-16 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all bg-slate-50 focus:bg-white"
              />
              <button 
                onClick={handleSendReply}
                disabled={sending || !reply.trim()}
                className="absolute right-3 bottom-3 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center"
              >
                {sending ? (
                  <span className="material-symbols-outlined animate-spin text-xl">sync</span> 
                ) : (
                  <span className="material-symbols-outlined text-xl">send</span>
                )}
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              Pressione Enter para pular linha. O cliente receberá por e-mail (em breve).
            </p>
          </div>
        </div>

        {/* --- SIDEBAR DE INFORMAÇÕES (DIREITA) --- */}
        <div className="w-80 border-l border-slate-200 overflow-y-auto bg-white hidden lg:block">
          <div className="p-6 space-y-8">
            
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
                  <p className="font-bold text-slate-800 truncate" title={customer?.name || ticket.customer_name}>
                    {customer?.name || ticket.customer_name || 'Nome não registrado'}
                  </p>
                  <p className="text-xs text-slate-500 truncate" title={customer?.email || ticket.customer_email}>
                    {customer?.email || ticket.customer_email || 'E-mail não registrado'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                 <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Telefone</span>
                    <span className="text-xs font-medium text-slate-700">{customer?.phone || '-'}</span>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Cidade</span>
                    <span className="text-xs font-medium text-slate-700">{customer?.default_address?.city || '-'}</span>
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
                  <p className="text-xs text-slate-500 mb-3">
                    {new Date(order.created_at || ticket.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-bold text-slate-800">R$ {order.total_price || '0,00'}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">remove_shopping_cart</span>
                  <p className="text-xs text-slate-400 font-medium">Nenhum pedido vinculado automaticamente.</p>
                </div>
              )}
            </div>

            {/* AÇÕES RÁPIDAS */}
            <div>
              <button 
                 onClick={() => alert('Função de Reembolso em desenvolvimento!')}
                 className="w-full py-3 rounded-xl border border-red-100 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">credit_card</span>
                Solicitar Reembolso
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}