import React from 'react';
import { LayoutDashboard, Store, Bot, Settings, ShoppingBag, CheckCircle } from 'lucide-react';

function App() {
  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* MENU LATERAL */}
      <aside className="w-64 bg-slate-800 flex flex-col border-r border-slate-700">
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold text-emerald-400">Mentagro OmniDesk</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-700 rounded-lg cursor-pointer">
            <LayoutDashboard size={20} />
            <span>Visão Geral</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
            <Store size={20} />
            <span>Lojas (50)</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
            <Bot size={20} />
            <span>Automação IA</span>
          </div>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold">G</div>
          </div>
        </header>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between mb-4 text-slate-400">
              <p>Faturamento Hoje</p>
              <ShoppingBag className="text-emerald-400" />
            </div>
            <h3 className="text-3xl font-bold">R$ 14.250</h3>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between mb-4 text-slate-400">
              <p>Tickets IA Resolvidos</p>
              <CheckCircle className="text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold">142</h3>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between mb-4 text-slate-400">
              <p>Lojas Ativas</p>
              <Store className="text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold">12 / 50</h3>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700"><h3 className="font-bold">Últimos Pedidos</h3></div>
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-sm">
              <tr><th className="p-4">Loja</th><th className="p-4">Cliente</th><th className="p-4">Valor</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
              <tr><td className="p-4">Loja Fitness</td><td className="p-4">Ana Silva</td><td className="p-4">R$ 249,90</td></tr>
              <tr><td className="p-4">PetShop Feliz</td><td className="p-4">Carlos S.</td><td className="p-4">R$ 89,90</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;