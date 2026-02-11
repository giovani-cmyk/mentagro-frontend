/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function AutomationScreen() {
  const [prompt, setPrompt] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [saving, setSaving] = useState(false);

  // Template do Checklist para facilitar o preenchimento
  const checklistTemplate = `* [ ] TOM DE VOZ: (Ex: Amigável e focado em vendas)
* [ ] POLÍTICA DE TROCA: (Ex: 7 dias, etiqueta intacta)
* [ ] PRAZOS DE POSTAGEM: (Ex: Até 48h úteis)
* [ ] FRETE E ENTREGAS: (Ex: Grátis acima de R$199)
* [ ] CANAL DE TRANSBORDO: (Ex: Casos de cancelamento passar para humano)
* [ ] PROTOCOLO DE FECHAMENTO: (Ex: Perguntar se a dúvida foi sanada)`;

  useEffect(() => {
    loadSettings();
    const interval = setInterval(loadSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data) {
      setPrompt(data.bot_prompt || '');
      const lastSeen = new Date(data.last_seen);
      const now = new Date();
      const diffInMinutes = (now - lastSeen) / 1000 / 60;
      setIsOnline(diffInMinutes < 5);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('settings')
      .update({ bot_prompt: prompt, updated_at: new Date() })
      .eq('id', 1);
    
    if (!error) alert("Manual do Robô atualizado com sucesso!");
    setSaving(false);
  };

  const applyTemplate = () => {
    if (window.confirm("Deseja aplicar o template de checklist? Isso não apagará o que você já escreveu, apenas adicionará ao final.")) {
      setPrompt(prev => prev + "\n\n" + checklistTemplate);
    }
  };

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">smart_toy</span>
          Automação & IA
        </h1>

        {/* Status do Robô */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-700">Status do Robô</h3>
            <div className={`flex items-center gap-2 font-bold ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
              <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isOnline ? 'IA Operacional' : 'IA Offline'}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-bold">Tecnologia</p>
            <p className="text-sm font-medium">Gemini 1.5 Pro + n8n</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA 1: Checklist de Referência */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">fact_check</span>
              Checklist de Sucesso
            </h3>
            <ul className="space-y-4">
              {[
                { label: 'Tom de Voz', desc: 'Define a personalidade' },
                { label: 'Trocas e Devoluções', desc: 'Evita confusão jurídica' },
                { label: 'Prazos de Entrega', desc: 'Gere a expectativa' },
                { label: 'Promoções Ativas', desc: 'Ajuda a vender mais' },
                { label: 'Regras de Transbordo', desc: 'Quando chamar você' }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button 
              onClick={applyTemplate}
              className="w-full mt-6 py-2 px-4 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
            >
              + Inserir Template no Texto
            </button>
          </div>

          {/* COLUNA 2: Editor da Base de Conhecimento */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">Base de Conhecimento</h3>
            <p className="text-sm text-slate-500 mb-6">Mantenha as informações abaixo sempre atualizadas para a IA.</p>
            
            <textarea 
              className="w-full h-96 p-5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed bg-slate-50/30 font-mono"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Cole o template ou escreva as regras aqui..."
            />
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-xs text-slate-400">
                <span className="material-symbols-outlined text-xs align-middle">info</span>
                O robô lê estas regras a cada nova mensagem.
              </p>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {saving ? 'Salvando...' : 'Salvar Manual'}
                <span className="material-symbols-outlined">save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}