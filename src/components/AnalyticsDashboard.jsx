/* eslint-disable */
// @ts-nocheck
import React from 'react';

export default function AnalyticsDashboard({ tickets }) {
  // Cálculos dos indicadores
  const total = tickets.length;
  const highPriority = tickets.filter(t => t.priority === 'HIGH').length;
  const botResolved = tickets.filter(t => t.status === 'RESOLVED').length; // Supondo que o bot resolve a maioria
  const negativeSentiment = tickets.filter(t => t.sentiment === 'NEGATIVE').length;
  
  const automationRate = total > 0 ? ((botResolved / total) * 100).toFixed(1) : 0;

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-600">monitoring</span>
        Painel Analítico
      </h1>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total de Tickets</p>
          <h2 className="text-3xl font-black text-slate-800">{total}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Taxa de Automação</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-blue-600">{automationRate}%</h2>
            <span className="material-symbols-outlined text-blue-400">auto_awesome</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Críticos (Alta Prioridade)</p>
          <h2 className="text-3xl font-black text-red-500">{highPriority}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Clientes Insatisfeitos</p>
          <h2 className="text-3xl font-black text-amber-600">{negativeSentiment}</h2>
        </div>
      </div>

      {/* SEÇÃO DE GRÁFICOS SIMPLES (CSS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Status da Operação</h3>
          <div className="space-y-4">
            {/* Barra de Progresso - Exemplo: Tickets em Aberto */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Pendentes com Humano</span>
                <span className="font-bold">{tickets.filter(t => t.status === 'PENDING_HUMAN').length}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${(tickets.filter(t => t.status === 'PENDING_HUMAN').length / total) * 100}%` }}></div>
              </div>
            </div>

            {/* Barra de Progresso - Exemplo: Resolvidos */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Resolvidos pela IA</span>
                <span className="font-bold">{botResolved}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${(botResolved / total) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* DISTRIBUIÇÃO DE SENTIMENTO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">sentiment_satisfied</span>
            <h3 className="font-bold text-slate-800 mb-2">Saúde do Atendimento</h3>
            <p className="text-slate-500 text-sm">
                A IA detectou que <strong>{(( (total - negativeSentiment) / total) * 100).toFixed(0)}%</strong> dos seus clientes estão com humor Neutro ou Positivo.
            </p>
        </div>
      </div>
    </div>
  );
}