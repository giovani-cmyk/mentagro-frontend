export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export type TicketStatus =
  | 'PENDING_HUMAN' | 'RESOLVED' | 'PENDING_AI'
  | 'BOT_REPLIED' | 'OPEN' | 'IN_PROGRESS'
  | 'WAITING' | 'CLOSED' | 'NEW' | 'URGENT'
  | 'DONE' | 'COMPLETED';

export type TicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Ticket {
  id: string;
  order_id: string;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  created_at: string;
  // Optional enriched fields (populated by joins or frontend logic)
  channel?: string;
  customer_name?: string;
  customer_email?: string;
  store_name?: string;
  messages?: string; // Summary or last message
  ticket_number?: number;
}

export interface Order {
  id: string;
  store_name: string;
  customer_id: string;
  status: string;
  tracking: string;
}

export type Sentiment = 'ANGRY' | 'NEUTRAL' | 'POSITIVE';

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  sentiment: Sentiment;
}

export type SenderType = 'CLIENT' | 'AI' | 'SYSTEM';

export interface Interaction {
  id: string;
  ticket_id: string;
  sender: SenderType;
  message: string;
  timestamp: string;
}

export interface Store {
  id: string;
  name: string;
  shopify_url: string;
  last_sync: string;
  created_at?: string;
}

export interface AppState {
  user: User;
  tickets: Ticket[];
  orders: Order[];
  customers: Customer[];
  interactions: Interaction[];
}
