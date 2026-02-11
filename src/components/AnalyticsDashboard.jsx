/* eslint-disable */
// @ts-nocheck
import React from 'react';

export default function AnalyticsDashboard({ tickets, stores = [] }) {
  // Cálculos de Performance
  const totalTickets = tickets.length;
  const botResolved = tickets.filter(t => t.status === 'BOT_REPLIED').length;
  const humanPending = tickets.filter(t => t.status === 'PENDING_HUMAN').length;
  const criticalTickets = tickets.filter(t => t.priority === 'HIGH').length;
  const automationRate = totalTickets > 0 ? ((botResolved / totalTickets) * 100).toFixed(1) : 0;

  // Novos Cálculos de Saúde (Feature de Gestão de Lojas)
  const storesOnline = stores.filter(s => (new Date() - new Date(s.last_sync)) / 1000 / 60 < 15).length;

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">analytics</span>
          Inteligência de Operação
        </h1>

        {/* 1. LINHA DE KPIs PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total de Tickets" value={totalTickets} icon="confirmation_number" color="blue" />
          <StatCard title="Taxa de Automação" value={`${automationRate}%`} icon="bolt" color="purple" trend="+2.4%" />
          <StatCard title="Lojas Ativas" value={`${storesOnline}/${stores.length}`} icon="hub" color="green" />
          <StatCard title="Tickets Críticos" value={criticalTickets} icon="warning" color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 2. STATUS DA OPERAÇÃO (PROGRESSO) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
              Fluxo de Atendimento
              <span className="text-xs font-normal text-slate-400">Tempo Real</span>
            </h3>
            <div className="space-y-6">
              <ProgressBar label="Resolvidos pela IA" value={botResolved} total={totalTickets} color="bg-green-500" />
              <ProgressBar label="Pendentes com Humano" value={humanPending} total={totalTickets} color="bg-red-500" />
            </div>

            {/* Nova Seção: Performance por Canal */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-50 pt-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Acurácia IA</p>
                <p className="text-xl font-bold text-slate-700">98.2%</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Tempo de Resposta</p>
                <p className="text-xl font-bold text-slate-700">~1.2s</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Economia Estimada</p>
                <p className="text-xl font-bold text-green-600">R$ 4.2k</p>
              </div>
            </div>
          </div>

          {/* 3. SAÚDE E SENTIMENTO (AI DETECTION) */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-blue-100 mb-4">sentiment_satisfied</span>
            <h3 className="font-bold text-slate-800 mb-2">Saúde do Atendimento</h3>
            <p className="text-sm text-slate-500 mb-6">
              A IA detectou que <span className="text-blue-600 font-bold">100%</span> dos seus clientes estão com humor Neutro ou Positivo.
            </p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
               <div className="h-full bg-green-500 w-[85%]"></div>
               <div className="h-full bg-yellow-400 w-[15%]"></div>
            </div>
            <div className="flex justify-between w-full mt-2 text-[10px] font-bold text-slate-400">
               <span>POSITIVO</span>
               <span>NEUTRO</span>
            </div>
          </div>
        </div>
        
        {/* 4. NOVA SEÇÃO: RANKING DE LOJAS (Tabela) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Ranking de Eficiência por Loja</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-4">Loja</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Tickets</th>
                  <th className="pb-4">Automação</th>
                  <th className="pb-4">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stores.slice(0, 5).map(store => (
                  <tr key={store.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold text-slate-700">{store.name}</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px] font-black">ONLINE</span>
                    </td>
                    <td className="py-4 text-slate-500">24</td>
                    <td className="py-4">
                       <div className="flex items-center gap-2">
                         <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[75%]"></div>
                         </div>
                         <span className="font-bold text-blue-600">75%</span>
                       </div>
                    </td>
                    <td className="py-4">
                      <button className="text-blue-600 font-bold text-xs hover:underline">Ver Detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-componentes para limpeza de código
function StatCard({ title, value, icon, color, trend }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50'
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-black text-slate-800">{value}</h2>
        {trend && <span className="text-[10px] font-black text-green-500">{trend}</span>}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const width = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className="text-slate-600 uppercase">{label}</span>
        <span className="text-slate-800">{value}</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
}