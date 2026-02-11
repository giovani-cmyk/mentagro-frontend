/* eslint-disable */
// @ts-nocheck
import React from 'react';

export default function Sidebar({ user, pendingCount, storeCount, currentView, onNavigate }) {
  // Lista de itens do menu com o rótulo de Lojas agora dinâmico
  const menuItems = [
    { id: 'inbox', label: 'Transbordo (Inbox)', icon: 'inbox' },
    { id: 'lojas', label: `Gestão de Lojas (${storeCount || 0})`, icon: 'store' },
    { id: 'automacao', label: 'Automação & IA', icon: 'smart_toy' },
    { id: 'analytics', label: 'Analíticos', icon: 'analytics' }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Logo da Aplicação */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <span className="material-symbols-outlined text-blue-500 text-3xl">bolt</span>
        <span className="font-bold text-lg tracking-tight">OmniDesk AI</span>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Menu Principal</div>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium group ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            
            {/* Badge de Alerta para Inbox (Tickets Pendentes) */}
            {item.id === 'inbox' && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Perfil do Usuário e Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <img 
            src={user?.avatar || 'https://via.placeholder.com/150'} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrador'}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter truncate">
              {user?.role || 'Acesso Master'}
            </p>
          </div>
          <button className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10">
            <span className="material-symbols-outlined text-xl font-icon">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}