import { useState, useEffect } from 'react';
import { supabase } from '../services/api';

interface Field {
  id: number | string;
  label: string;
  content: string;
}

interface SettingsData {
  padrão: Field[];
  personalizadas: Field[];
}

export default function AutomationScreen() {
  const [data, setData] = useState<SettingsData>({ padrão: [], personalizadas: [] });
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: res } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (res && res.bot_prompt) {
      const parsedData = typeof res.bot_prompt === 'string' ? JSON.parse(res.bot_prompt) : res.bot_prompt;
      setData(parsedData);

      // Como a nossa IA é Serverless (Sob Demanda), ela está sempre pronta e operacional!
      setIsOnline(true);
    }
  }

  const handleUpdateField = (type: 'padrão' | 'personalizadas', id: number | string, value: string) => {
    setError(null);
    const newData = { ...data };
    // We need to be careful with references, but for this level of depth it's okay-ish, 
    // though mapping is safer for immutability.
    const list = newData[type].map(f => {
      if (f.id === id) {
        return { ...f, content: value };
      }
      return f;
    });

    setData({ ...newData, [type]: list });
  };

  const handleUpdateLabel = (id: number | string, newLabel: string) => {
    const newData = { ...data };
    const list = newData.personalizadas.map(f => {
      if (f.id === id) {
        return { ...f, label: newLabel };
      }
      return f;
    });
    setData({ ...newData, personalizadas: list });
  };

  const handleSave = async () => {
    // 🛑 VALIDAÇÃO: Verifica se algum campo padrão está vazio
    const emptyFields = data.padrão.filter(f => f.content.trim() === "");

    if (emptyFields.length > 0) {
      setError(`Atenção: Os campos ${emptyFields.map(f => f.label).join(", ")} são obrigatórios!`);
      return;
    }

    setSaving(true);
    const { error: supabaseError } = await supabase
      .from('settings')
      .update({ bot_prompt: data })
      .eq('id', 1);

    if (!supabaseError) {
      alert("Cérebro da IA atualizado com sucesso! 🚀");
      setError(null);
    } else {
      console.error(supabaseError);
      setError("Erro ao salvar configurações.");
    }
    setSaving(false);
  };

  const addCustomField = () => {
    setData({
      ...data,
      personalizadas: [
        ...data.personalizadas,
        { id: Date.now(), label: 'Nova Regra', content: '' }
      ]
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex-1 p-8 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto">
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined">warning</span>
              {error}
            </div>
          )}

          {/* CAMPOS OBRIGATÓRIOS */}
          <div className="mb-12">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Campos Obrigatórios</h2>
            <div className="grid grid-cols-1 gap-4">
              {data.padrão.map(field => (
                <div key={field.id} className={`bg-white p-6 rounded-2xl border-2 transition-all duration-300 ${field.content.trim() === "" ? 'border-red-100 bg-red-50/20' : 'border-green-500 shadow-sm'}`}>
                  <label className="text-xs font-black text-slate-500 uppercase mb-3 block">{field.label}</label>
                  <textarea
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    rows={2}
                    value={field.content}
                    onChange={(e) => handleUpdateField('padrão', field.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* PERSONALIZADAS */}
          <div className="mb-12">
            <div className="flex justify-between mb-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Personalizadas</h2>
              <button onClick={addCustomField} className="text-blue-600 text-xs font-bold hover:underline">+ Adicionar</button>
            </div>
            <div className="space-y-4">
              {data.personalizadas.map(field => (
                <div key={field.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100">
                  <input
                    className="text-sm font-bold text-blue-600 mb-2 w-full outline-none bg-transparent"
                    value={field.label}
                    onChange={(e) => handleUpdateLabel(field.id, e.target.value)}
                  />
                  <textarea
                    className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none resize-none"
                    rows={2}
                    value={field.content}
                    onChange={(e) => handleUpdateField('personalizadas', field.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 BOTÃO ALINHADO: Sticky Footer dentro do conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full max-w-lg py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${saving ? 'bg-slate-400' : 'bg-slate-900 hover:bg-blue-600 text-white active:scale-95'}`}
        >
          {saving ? 'Sincronizando...' : 'Atualizar Cérebro da IA'}
          <span className="material-symbols-outlined font-icon">bolt</span>
        </button>
      </div>
    </div>
  );
}