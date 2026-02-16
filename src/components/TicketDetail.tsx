import { useState } from 'react';
import { supabase } from '../services/api';
import type { Ticket, Order, Customer, Interaction, TicketStatus } from '../types';

interface TicketDetailProps {
  ticket: Ticket;
  order: Order;
  customer: Customer;
  interactions: Interaction[];
  onClose: () => void;
}

export default function TicketDetail({ ticket, order, customer, interactions, onClose }: TicketDetailProps) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [localInteractions, setLocalInteractions] = useState<Interaction[]>(interactions || []);

  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(ticket.status || 'OPEN');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getStatusStyle = (status: string) => {
    const s = status ? status.toUpperCase() : '';
    if (['OPEN', 'PENDING_HUMAN', 'URGENT'].includes(s)) return 'bg-red-50 text-red-600 border-red-100';
    if (['IN_PROGRESS', 'WAITING', 'BOT_REPLIED'].includes(s)) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (['RESOLVED', 'CLOSED', 'DONE'].includes(s)) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;
      setCurrentStatus(newStatus);
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);

    try {
      // CHAMA A FUNÇÃO NA NUVEM PARA DISPARAR O E-MAIL VIA RESEND
      const { error } = await supabase.functions.invoke('send-ticket-reply', {
        body: {
          ticket_id: ticket.id,
          message: reply,
          customer_email: ticket.customer_email,
          subject: ticket.subject
        }
      });

      if (error) throw error;

      // ATUALIZA A TELA INSTANTANEAMENTE
      const newMessage: Interaction = {
        id: Date.now().toString(),
        ticket_id: ticket.id,
        sender: 'SYSTEM',
        message: reply,
        created_at: new Date().toISOString()
      };

      setLocalInteractions([...localInteractions, newMessage]);
      setReply('');

      if (currentStatus === 'PENDING_HUMAN' || currentStatus === 'OPEN') {
        handleUpdateStatus('IN_PROGRESS');
      }
    } catch (err: any) {
      alert('Erro ao enviar e-mail: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSending(false);
    }
  };

  const hasRealCustomer = customer && customer.name && customer.name !== 'Desconhecido';
  const hasRealOrder = order && order.id !== 'unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 ring-1 ring-white/20">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full text-slate-400 transition-all z-20"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="border-b border-slate-100 p-5 flex items-center justify-between bg-white shrink-0 pr-16">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-400">
                #{ticket.ticket_number || ticket.id.toString().slice(-4)}
              </span>
              <h2 className="text-lg font-bold text-slate-800 line-clamp-1">
                {ticket.subject || 'Sem Assunto'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
              {new Date(ticket.created_at).toLocaleDateString('pt-BR')} às {new Date(ticket.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="relative">
            <select
              value={currentStatus}
              disabled={updatingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
              className={`pl-3 pr-8 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border cursor-pointer outline-none appearance-none transition-all hover:opacity-80 ${getStatusStyle(currentStatus)}`}
            >
              <option value="OPEN">🔴 Em Aberto</option>
              <option value="WAITING">🟡 Em Espera</option>
              <option value="RESOLVED">🟢 Concluído</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col relative bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {ticket.messages && (
                <div className="flex justify-center mb-6">
                  <div className="bg-yellow-50/80 border border-yellow-200/60 p-4 rounded-xl max-w-2xl w-full">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-yellow-100">
                      <span className="material-symbols-outlined text-yellow-600 text-sm">smart_toy</span>
                      <strong className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">
                        Resumo Automático
                      </strong>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {ticket.messages}
                    </div>
                  </div>
                </div>
              )}

              {localInteractions.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'SYSTEM' || msg.sender === 'AI' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.sender === 'SYSTEM' || msg.sender === 'AI'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                    }`}>
                    <p className="text-[10px] font-black mb-1 opacity-70 uppercase tracking-wider">
                      {msg.sender === 'SYSTEM' ? 'Suporte' : msg.sender}
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-[10px] mt-2 opacity-50 text-right">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Agora'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <textarea
                  rows={1}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escreva uma resposta..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-14 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none transition-all"
                  style={{ minHeight: '50px' }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending || !reply.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 transition-all flex items-center"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-80 bg-white border-l border-slate-100 overflow-y-auto hidden lg:block">
            <div className="p-6 space-y-8">
              {hasRealCustomer ? (
                <>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cliente Shopify</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 text-sm truncate">{customer.name}</p>
                        <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                      </div>
                    </div>
                  </div>

                  {hasRealOrder && (
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-6">Pedido Vinculado</h3>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-700 text-sm">#{order.store_name} - {order.status}</span>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {order.status || 'Pago'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Tracking</span>
                          <span className="font-bold text-slate-800">{order.tracking}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhes do E-mail</h3>
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Remetente</label>
                      <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 break-all">
                        <span className="material-symbols-outlined text-xs text-slate-400">mail</span>
                        {ticket.customer_email || 'Não informado'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Data</label>
                        <div className="text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hora</label>
                        <div className="text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {new Date(ticket.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Canal</label>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">mail</span> E-mail
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}