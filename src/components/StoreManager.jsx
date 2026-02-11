/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function StoreManager({ onUpdateCount }) {
  const [stores, setStores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({ name: '', shopify_url: '' });

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    const { data } = await supabase.from('stores').select('*').order('created_at');
    if (data) {
      setStores(data);
      onUpdateCount(data.length); // Atualiza o número na Sidebar
    }
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingStore) {
      await supabase.from('stores').update(formData).eq('id', editingStore.id);
    } else {
      await supabase.from('stores').insert([formData]);
    }
    setFormData({ name: '', shopify_url: '' });
    setEditingStore(null);
    setIsModalOpen(false);
    loadStores();
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja remover esta loja? A automação será interrompida.")) {
      await supabase.from('stores').delete().eq('id', id);
      loadStores();
    }
  };

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">hub</span>
            Hub de Lojas ({stores.length})
          </h1>
          <button 
            onClick={() => { setEditingStore(null); setFormData({name:'', shopify_url:''}); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all"
          >
            <span className="material-symbols-outlined">add</span> Conectar Nova Loja
          </button>
        </div>

        {/* LISTAGEM DINÂMICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <div key={store.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group">
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">storefront</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black ${
                  (new Date() - new Date(store.last_sync)) / 1000 / 60 < 15 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {(new Date() - new Date(store.last_sync)) / 1000 / 60 < 15 ? 'CONECTADO' : 'OFFLINE'}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{store.name}</h3>
              <p className="text-xs text-slate-400 mb-6 truncate">{store.shopify_url}</p>
              
              <div className="flex justify-between pt-4 border-t border-slate-50">
                <button 
                  onClick={() => { setEditingStore(store); setFormData({name: store.name, shopify_url: store.shopify_url}); setIsModalOpen(true); }}
                  className="material-symbols-outlined text-slate-300 hover:text-blue-600 transition-colors"
                >
                  settings
                </button>
                <button 
                  onClick={() => handleDelete(store.id)}
                  className="material-symbols-outlined text-slate-300 hover:text-red-500 transition-colors"
                >
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE CADASTRO/EDIÇÃO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-6">{editingStore ? 'Editar Loja' : 'Cadastrar Nova Loja'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome da Loja</label>
                  <input required className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">URL Shopify</label>
                  <input required className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="loja.myshopify.com" value={formData.shopify_url} onChange={e => setFormData({...formData, shopify_url: e.target.value})} />
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">
                    {editingStore ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}