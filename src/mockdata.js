export const INITIAL_STATE = {
  user: {
    id: 'u1',
    name: 'Jane Smith',
    role: 'Agente Sênior',
    avatar: 'https://i.pravatar.cc/150?u=jane'
  },
  tickets: [
    { id: 't1', order_id: 'o1', status: 'PENDING_HUMAN', priority: 'HIGH', subject: 'Atraso na entrega - Urgente', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 't2', order_id: 'o2', status: 'PENDING_HUMAN', priority: 'MEDIUM', subject: 'Produto veio com defeito', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 't3', order_id: 'o3', status: 'RESOLVED', priority: 'LOW', subject: 'Dúvida sobre tamanho', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
  ],
  orders: [
    { id: 'o1', store_name: 'Loja Fitness', customer_id: 'c1', status: 'DELAYED', tracking_code: 'BR123456789', items: [{ id: 'i1', name: 'Tênis Runner Pro', image: 'https://placehold.co/100' }] },
    { id: 'o2', store_name: 'PetShop Feliz', customer_id: 'c2', status: 'DELIVERED', tracking_code: 'BR987654321', items: [{ id: 'i2', name: 'Ração Premium 15kg', image: 'https://placehold.co/100' }] },
    { id: 'o3', store_name: 'Moda Verão', customer_id: 'c3', status: 'PROCESSING', tracking_code: 'BR555555555', items: [{ id: 'i3', name: 'Biquíni Tropical', image: 'https://placehold.co/100' }] }
  ],
  customers: [
    { id: 'c1', name: 'Ana Silva', email: 'ana.silva@email.com', avatar: 'https://i.pravatar.cc/150?u=ana', ltv: 2450, csat: 4.8, sentiment: 'ANGRY' },
    { id: 'c2', name: 'Carlos Santos', email: 'carlos.s@email.com', avatar: 'https://i.pravatar.cc/150?u=carlos', ltv: 890, csat: 5.0, sentiment: 'NEUTRAL' },
    { id: 'c3', name: 'Beatriz Costa', email: 'bia.costa@email.com', avatar: 'https://i.pravatar.cc/150?u=bia', ltv: 120, csat: 4.5, sentiment: 'POSITIVE' }
  ],
  interactions: [
    { id: 'm1', ticket_id: 't1', sender: 'CLIENT', message: 'Bom dia, meu pedido deveria ter chegado ontem!', timestamp: new Date().toISOString() },
    { id: 'm2', ticket_id: 't1', sender: 'AI', message: 'Olá Ana! Verifiquei que houve um atraso na transportadora devido às chuvas. A nova previsão é para amanhã.', timestamp: new Date().toISOString() },
    { id: 'm3', ticket_id: 't1', sender: 'CLIENT', message: 'Não posso esperar, preciso disso urgente para uma viagem.', timestamp: new Date().toISOString() },
    { id: 'm4', ticket_id: 't1', sender: 'SYSTEM', message: 'Transbordo por Sentimento Negativo detectado.', timestamp: new Date().toISOString() }
  ]
};