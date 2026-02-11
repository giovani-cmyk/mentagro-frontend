/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function AutomationScreen() {
  const [prompt, setPrompt] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    const interval = setInterval(loadSettings, 30000); // Checa status a cada 30s
    return () => clearInterval(interval);
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data) {
      setPrompt(data.bot_prompt);
      
      // Lógica do Status Real
      const lastSeen = new Date(data.last_seen);
      const now = new Date();
      const diffInMinutes = (now - lastSeen) / 1000 / 60;
      setIsOnline(diffInMinutes < 5); // Online se o sinal tem menos de 5 min
    }
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('settings')
      .update({ bot_prompt: prompt, updated_at: new Date() })
      .eq('id', 1);
    
    if (error) alert("Erro ao salvar!");
    else alert("Manual do Robô atualizado!");
    setSaving(false);
  };

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">smart_toy</span>
          Automação & IA
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card de Status Real */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-2 text-slate-700">Status do Robô</h3>
            <div className={`flex items-center gap-3 font-bold ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
              <span className="relative flex h-3 w-3">
                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              {isOnline ? 'IA Operacional no Shopify' : 'IA Desconectada (Verificar n8n)'}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">Monitoramento automático via sinal de vida do robô.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tecnologia</p>
             <p className="text-sm font-medium">Gemini 1.5 Pro + n8n Workflow</p>
          </div>
        </div>

        {/* Editor de Base de Conhecimento */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-2 text-slate-800">Base de Conhecimento</h3>
          <p className="text-sm text-slate-500 mb-6">As informações abaixo servem de guia para todas as respostas da IA.</p>
          
          <textarea 
            className="w-full h-80 p-5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed bg-slate-50/30"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Digite aqui as regras da sua loja..."
          />
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {saving ? 'Salvando...' : 'Salvar Manual do Robô'}
            <span className="material-symbols-outlined">save</span>
          </button>
        </div>
      </div>
    </div>
  );
}