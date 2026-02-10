import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ id: 'u1', name: 'Jane Smith', role: 'Agente Sênior', avatar: 'https://i.pravatar.cc/150?u=jane' });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-16 bg-blue-600 rounded-2xl mb-6 shadow-xl"><span className="material-symbols-outlined text-4xl text-white">bolt</span></div>
          <h1 className="text-3xl font-black text-white mb-2">OmniDesk AI</h1>
          <p className="text-slate-400 text-sm">Plataforma Inteligente</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              {isLoading ? 'Carregando...' : 'Entrar na Plataforma'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}