/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function StoreManager() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
    const interval = setInterval(loadStores, 30000); // Atualiza status a cada 30s
    return () => clearInterval(interval);
  }, []);

  async function loadStores() {
    const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    if (data) setStores(data);
    setLoading(false);
  }

  // Função que decide se a loja está online de verdade
  const getRealStatus = (lastSync) => {
    const lastSeen = new Date(lastSync);
    const diffInMinutes = (new Date() - lastSeen) / 1000 / 60;
    return diffInMinutes < 15; // Online se sincronizou nos últimos 15 min
  };

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">hub</span>
            Hub de Lojas Conectadas ({stores.length})
          </h1>
          <p className="text-xs text-slate-400 font-medium italic">
            Cadastro e API Keys gerenciados via n8n
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => {
            const isOnline = getRealStatus(store.last_sync);
            return (
              <div key={store.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${isOnline ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                    <span className="material-symbols-outlined">storefront</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                    isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {isOnline ? 'CONECTADO' : 'SEM SINAL'}
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-lg mb-1">{store.name}</h3>
                <p className="text-xs text-slate-400 mb-6 truncate">{store.shopify_url}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                    Último check: {new Date(store.last_sync).toLocaleTimeString()}
                  </span>
                  <button 
                    onClick={() => alert(`Acessando logs da loja ${store.name} no n8n...`)}
                    className="material-symbols-outlined text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    analytics
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}