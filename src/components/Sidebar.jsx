import React from 'react';

export default function Sidebar({ user, pendingCount, currentView, onNavigate }) {
  const menuItems = [
    { id: 'inbox', label: 'Transbordo (Inbox)', icon: 'inbox' },
    { id: 'lojas', label: 'Gestão de Lojas (50)', icon: 'store' },
    { id: 'automacao', label: 'Automação & IA', icon: 'smart_toy' },
    { id: 'analytics', label: 'Analíticos', icon: 'analytics' }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen border-r border-slate-800">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <span className="material-symbols-outlined text-blue-500 text-3xl">bolt</span>
        <span className="font-bold text-lg tracking-tight">OmniDesk AI</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Menu Principal</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-medium ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === 'inbox' && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Usuário */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full border border-slate-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.role}</p>
          </div>
          <button className="text-slate-400 hover:text-red-400"><span className="material-symbols-outlined text-xl">logout</span></button>
        </div>
      </div>
    </aside>
  );
}