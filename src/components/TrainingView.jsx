import React from 'react';

export default function TrainingView({ onToggleSidebar }) {
  return (
    <div className="flex-1 p-4 lg:p-8 bg-white h-full overflow-y-auto custom-scrollbar">
      <header className="mb-8 flex items-start gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 -ml-2 text-slate-500">
            <span className="material-symbols-outlined">menu</span>
        </button>
        <div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Inteligência <span className="material-symbols-outlined text-[10px]">chevron_right</span> Dados de Treinamento
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ajuste Fino do Modelo</h1>
          <p className="text-sm text-slate-500 mt-1">Revise as correções para melhorar o Gemini AI.</p>
        </div>
      </header>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="size-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold text-blue-900">Sugestão de Treinamento</h4>
          <p className="text-xs text-blue-700 mt-1">Detectamos 12 novos padrões de resposta em 'Reembolsos'. Deseja aprovar?</p>
        </div>
        <button className="sm:ml-auto w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition">Aprovar Todos</button>
      </div>

      <div className="space-y-4">
        {[
          { q: "Qual o prazo de entrega para o CEP 01001-000?", ai: "O prazo é de 5 dias úteis.", agent: "Na verdade, para este CEP específico, o prazo é de 2 dias úteis via Sedex.", status: 'PENDING' },
          { q: "Posso devolver se a embalagem estiver aberta?", ai: "Não aceitamos devoluções com embalagem aberta.", agent: "Aceitamos sim, desde que o produto esteja intacto.", status: 'REJECTED' },
        ].map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amostra #{2034 - i}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                {item.status === 'PENDING' ? 'Aguardando Revisão' : 'Rejeitado'}
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pergunta do Usuário</p>
                <p className="text-sm font-semibold text-slate-900">"{item.q}"</p>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                  <p className="text-[10px] text-indigo-600 font-bold mb-1">RESPOSTA IA</p>
                  <p className="text-xs text-indigo-900 italic">"{item.ai}"</p>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4 flex-1">
                  <p className="text-[10px] text-blue-600 font-bold mb-1">CORREÇÃO HUMANA</p>
                  <p className="text-xs text-blue-900 font-bold">"{item.agent}"</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition">Ignorar</button>
                  <button className="flex-1 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-md">Aprovar</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}