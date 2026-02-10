/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulação de verificação de segurança (fake API delay)
    setTimeout(() => {
      
      // 👇 LISTA DE USUÁRIOS PERMITIDOS
      const validUsers = [
        {
          id: 'master-01',
          name: 'Giovani',
          email: 'giovani@apicedobrasil.com.br',
          password: '@lfanumericA14',
          role: 'Admin Master'
        },
        {
          id: 'admin-02',
          name: 'Jefferson Silva',
          email: 'jeffersonsilva857@gmail.com',
          password: 'A1b2c3d4e5@',
          role: 'Analista'
        }
      ];

      // Busca na lista se existe alguém com esse email E senha
      const foundUser = validUsers.find(u => u.email === email && u.password === password);

      if (foundUser) {
        // Se achou, faz o login
        onLogin({
          id: foundUser.id,
          name: foundUser.name,
          role: foundUser.role,
          // Gera o avatar automaticamente com as iniciais
          avatar: `https://ui-avatars.com/api/?name=${foundUser.name}&background=0D8ABC&color=fff`
        });
      } else {
        setError('Acesso negado. Verifique suas credenciais.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      {/* Fundo decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-500/20">
            <span className="material-symbols-outlined text-4xl text-white">bolt</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">OmniDesk AI</h1>
          <p className="text-slate-400 text-sm">Acesso Restrito Administrativo</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">E-mail Corporativo</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="nome@empresa.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Senha de Acesso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              ) : (
                <>Entrar no Painel <span className="material-symbols-outlined text-sm">arrow_forward</span></>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-slate-600 text-xs">
          Protegido por OmniDesk Security &bull; 2026
        </p>
      </div>
    </div>
  );
}