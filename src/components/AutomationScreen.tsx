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

// Dados de segurança caso o banco falhe
const INITIAL_SCHEMA: SettingsData = {
  padrão: [
    { id: 1, label: "TOM DE VOZ", content: "" },
    { id: 2, label: "POLÍTICA DE TROCA", content: "" },
    { id: 3, label: "PRAZOS DE POSTAGEM", content: "" },
    { id: 4, label: "FRETE E ENTREGAS", content: "" }
  ],
  personalizadas: []
};

export default function AutomationScreen() {
  const [data, setData] = useState<SettingsData>(INITIAL_SCHEMA);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data: res, error: dbError } = await supabase.from('settings').select('*').eq('id', 1).single();

      if (dbError) throw dbError;

      if (res && res.bot_prompt) {
        const parsedData = typeof res.bot_prompt === 'string' ? JSON.parse(res.bot_prompt) : res.bot_prompt;

        // Validação: se o JSON vier sem a chave "padrão", usamos o esquema inicial
        if (parsedData.padrão) {
          setData(parsedData);
        } else {
          setData(INITIAL_SCHEMA);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar configurações, usando esquema padrão:", err);
      setData(INITIAL_SCHEMA); // Força a exibição dos campos mesmo com erro no banco
    } finally {
      setIsOnline(true);
    }
  }

  const handleUpdateField = (type: 'padrão' | 'personalizadas', id: number | string, value: string) => {
    setError(null);
    const list = data[type].map(f => f.id === id ? { ...f, content: value } : f);
    setData({ ...data, [type]: list });
  };

  const handleUpdateLabel = (id: number | string, newLabel: string) => {
    const list = data.personalizadas.map(f => f.id === id ? { ...f, label: newLabel } : f);
    setData({ ...data, personalizadas: list });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from('settings')
        .upsert({ id: 1, bot_prompt: data });

      if (supabaseError) throw supabaseError;
      alert("Cérebro da IA atualizado com sucesso! 🚀");
    } catch (err: any) {
      setError("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addCustomField = () => {
    setData({
      ...data,
      personalizadas: [...data.personalizadas, { id: Date.now(), label: 'Nova Regra', content: '' }]
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative font-sans">
      <div className="flex-1 p-8 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">psychology</span>
              Automação & IA
            </h1>
            <div className="px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-green-100 text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              IA OPERACIONAL
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="mb-12">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Campos Obrigatórios</h2>
            <div className="grid grid-cols-1 gap-4">
              {data.padrão.map(field => (
                <div key={field.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                  <label className="text-xs font-black text-slate-500 uppercase mb-3 block">{field.label}</label>
                  <textarea
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    rows={2}
                    value={field.content}
                    onChange={(e) => handleUpdateField('padrão', field.id, e.target.value)}
                    placeholder={`Digite aqui as regras de ${field.label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>

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

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full max-w-lg py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${saving ? 'bg-slate-400' : 'bg-slate-900 hover:bg-blue-600 text-white active:scale-95'}`}
        >
          {saving ? 'Sincronizando...' : 'Atualizar Cérebro da IA'}
          <span className="material-symbols-outlined">bolt</span>
        </button>
      </div>
    </div>
  );
}