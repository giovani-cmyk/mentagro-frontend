import React from 'react';

export default function Sidebar({ user, pendingCount, currentView, isOpen, onClose, onNavigate, onLogout }) {
  const getBtnClass = (view) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${currentView === view ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:relative inset-y-0 left-0 w-72 lg:w-64 bg-white border-r border-slate-200 z-50 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><span className="material-symbols-outlined text-lg">bolt</span></div>
          <span className="font-bold text-slate-900">OmniDesk AI</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button onClick={() => onNavigate('inbox')} className={getBtnClass('inbox')}>
            <span className="material-symbols-outlined">inbox</span> <span className="flex-1 text-left">Caixa de Entrada</span>
            {pendingCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 rounded-full">{pendingCount}</span>}
          </button>
          <button onClick={() => onNavigate('analytics')} className={getBtnClass('analytics')}>
            <span className="material-symbols-outlined">analytics</span> <span className="flex-1 text-left">Analíticos</span>
          </button>
          <button onClick={() => onNavigate('training')} className={getBtnClass('training')}>
            <span className="material-symbols-outlined">model_training</span> <span className="flex-1 text-left">Treinamento</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
          <img src={user.avatar} className="size-8 rounded-full" alt="User" />
          <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{user.name}</p><p className="text-[10px] text-slate-500">{user.role}</p></div>
          <button onClick={onLogout} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">logout</span></button>
        </div>
      </aside>
    </>
  );
}