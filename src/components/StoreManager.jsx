/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function StoreManager() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      const { data } = await supabase.from('stores').select('*').order('name');
      if (data) setStores(data);
      setLoading(false);
    }
    loadStores();
  }, []);

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">store</span>
            Gestão de Lojas ({stores.length})
          </h1>
          <button className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            Conectar Nova Loja
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <div key={store.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                  {store.name.substring(0, 2).toUpperCase()}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                  store.status === 'CONECTADO' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {store.status}
                </div>
              </div>

              <h3 className="font-bold text-slate-800 text-lg">{store.name}</h3>
              <p className="text-xs text-slate-400 mb-6 truncate">{store.shopify_url}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${store.is_ai_enabled ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                   <span className="text-xs font-bold text-slate-500">IA {store.is_ai_enabled ? 'Ativa' : 'Pausada'}</span>
                </div>
                <button className="material-symbols-outlined text-slate-400 hover:text-blue-600 transition-colors">settings</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}