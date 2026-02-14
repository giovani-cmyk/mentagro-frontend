import type { AppState } from '../types';

export const INITIAL_STATE: AppState = {
    user: {
        id: 'master-01',
        name: 'Giovani',
        role: 'Admin Master',
        avatar: 'https://ui-avatars.com/api/?name=Giovani&background=0D8ABC&color=fff'
    },
    tickets: [
        { id: 't1', order_id: 'o1', status: 'PENDING_HUMAN', priority: 'HIGH', subject: 'Reclamação: Atraso na Entrega', created_at: new Date().toISOString() },
        { id: 't2', order_id: 'o2', status: 'PENDING_HUMAN', priority: 'MEDIUM', subject: 'Produto veio errado (Troca)', created_at: new Date().toISOString() },
        { id: 't3', order_id: 'o3', status: 'RESOLVED', priority: 'LOW', subject: 'Dúvida sobre voltagem', created_at: new Date().toISOString() }
    ],
    orders: [
        { id: 'o1', store_name: 'Loja Fitness (01)', customer_id: 'c1', status: 'ATRASADO', tracking: 'BR123456' },
        { id: 'o2', store_name: 'PetShop (12)', customer_id: 'c2', status: 'ENTREGUE', tracking: 'BR987654' },
        { id: 'o3', store_name: 'Eletrônicos (45)', customer_id: 'c3', status: 'PROCESSANDO', tracking: 'BR555555' }
    ],
    customers: [
        { id: 'c1', name: 'Ana Silva', email: 'ana@gmail.com', avatar: 'https://i.pravatar.cc/150?u=a', sentiment: 'ANGRY' },
        { id: 'c2', name: 'Carlos Souza', email: 'carlos@hotmail.com', avatar: 'https://i.pravatar.cc/150?u=c', sentiment: 'NEUTRAL' },
        { id: 'c3', name: 'Bia Costa', email: 'bia@outlook.com', avatar: 'https://i.pravatar.cc/150?u=b', sentiment: 'POSITIVE' }
    ],
    interactions: [
        { id: 'm1', ticket_id: 't1', sender: 'CLIENT', message: 'Onde está meu pedido? Já passou do prazo!', timestamp: new Date().toISOString() },
        { id: 'm2', ticket_id: 't1', sender: 'AI', message: 'Olá Ana. Verifiquei que houve um atraso na transportadora. Deseja abrir uma reclamação?', timestamp: new Date().toISOString() },
        { id: 'm3', ticket_id: 't1', sender: 'SYSTEM', message: 'Transbordo automático: Cliente irritado detectado.', timestamp: new Date().toISOString() }
    ]
};
