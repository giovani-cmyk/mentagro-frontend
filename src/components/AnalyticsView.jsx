import React from 'react';

export default function AnalyticsView({ onToggleSidebar }) {
  return (
    <div className="flex-1 p-4 lg:p-8 bg-white h-full overflow-y-auto custom-scrollbar">
      <header className="mb-8 flex items-start gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 -ml-2 text-slate-500">
            <span className="material-symbols-outlined">menu</span>
        </button>
        <div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Inteligência <span className="material-symbols-outlined text-[10px]">chevron_right</span> Analíticos
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Desempenho da Automação</h1>
          <p className="text-sm text-slate-500 mt-1">Status atual do Gemini AI no transbordo.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Resolução IA</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">84.2%</span>
            <span className="text-[10px] font-bold text-green-600 mb-1 bg-green-100 px-1.5 py-0.5 rounded">+2.4%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
            <div className="w-[84%] h-full bg-green-500 rounded-full" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Tempo Médio (IA)</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">1.8s</span>
            <span className="text-[10px] font-bold text-blue-600 mb-1 bg-blue-100 px-1.5 py-0.5 rounded">Instantâneo</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Escalação Humana</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">15.8%</span>
            <span className="text-[10px] font-bold text-orange-600 mb-1 bg-orange-100 px-1.5 py-0.5 rounded">Na meta</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Motivos de Transbordo</h3>
          <div className="space-y-6">
            {[
              { label: 'Segurança (Violação de Regras)', value: 42, color: 'bg-red-500' },
              { label: 'Sentimento Negativo Detectado', value: 28, color: 'bg-orange-500' },
              { label: 'Ambiguidade / Incerteza', value: 20, color: 'bg-blue-500' },
              { label: 'Outros', value: 10, color: 'bg-slate-300' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-slate-900">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}