/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function AutomationScreen() {
  const [data, setData] = useState({ padrão: [], personalizadas: [] });
  const [isOnline, setIsOnline] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: res } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (res && res.bot_prompt) {
      setData(typeof res.bot_prompt === 'string' ? JSON.parse(res.bot_prompt) : res.bot_prompt);
      const lastSeen = new Date(res.last_seen);
      const diffInMinutes = (new Date() - lastSeen) / 1000 / 60;
      setIsOnline(diffInMinutes < 5);
    }
  }

  const handleUpdateField = (type, id, value) => {
    const newData = { ...data };
    const field = newData[type].find(f => f.id === id);
    if (field) field.content = value;
    setData(newData);
  };

  const handleAddCustom = () => {
    const newData = { ...data };
    const newId = Date.now();
    newData.personalizadas.push({ id: newId, label: 'Nova Instrução', content: '' });
    setData(newData);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('settings').update({ bot_prompt: data }).eq('id', 1);
    if (!error) alert("Cérebro da IA atualizado!");
    setSaving(false);
  };

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-24">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">psychology</span>
            Automação & IA
          </h1>
          <div className={`px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isOnline ? 'IA OPERACIONAL' : 'IA DESCONECTADA'}
          </div>
        </div>

        {/* CAMPOS OBRIGATÓRIOS (FICAM VERDES AO PREENCHER) */}
        <div className="mb-12">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Campos Obrigatórios</h2>
          <div className="grid grid-cols-1 gap-4">
            {data.padrão.map(field => (
              <div key={field.id} className={`bg-white p-6 rounded-2xl border-2 transition-all duration-500 ${field.content.length > 3 ? 'border-green-500 shadow-lg shadow-green-500/10' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-slate-500 uppercase">{field.label}</label>
                  {field.content.length > 3 && <span className="text-green-500 material-symbols-outlined text-sm">check_circle</span>}
                </div>
                <textarea 
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows="2"
                  value={field.content}
                  onChange={(e) => handleUpdateField('padrão', field.id, e.target.value)}
                  placeholder={`Insira as informações de ${field.label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* INSTRUÇÕES PERSONALIZADAS */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Instruções Personalizadas</h2>
            <button onClick={handleAddCustom} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-all">
              <span className="material-symbols-outlined text-sm">add</span> Adicionar Instrução
            </button>
          </div>
          
          <div className="space-y-4">
            {data.personalizadas.map(field => (
              <div key={field.id} className={`bg-white p-6 rounded-2xl border-2 transition-all ${field.content.length > 3 ? 'border-green-500' : 'border-slate-100'}`}>
                <input 
                  className="text-sm font-bold text-blue-600 mb-3 bg-transparent border-b border-dashed border-blue-200 focus:border-blue-600 outline-none w-full pb-1"
                  value={field.label}
                  onChange={(e) => {
                    const newData = {...data};
                    newData.personalizadas.find(f => f.id === field.id).label = e.target.value;
                    setData(newData);
                  }}
                />
                <textarea 
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows="2"
                  value={field.content}
                  onChange={(e) => handleUpdateField('personalizadas', field.id, e.target.value)}
                  placeholder="Escreva a instrução personalizada aqui..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOTÃO SALVAR FIXO */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {saving ? 'Sincronizando...' : 'Atualizar Cérebro da IA'}
            <span className="material-symbols-outlined">bolt</span>
          </button>
        </div>
      </div>
    </div>
  );
}