import { createClient } from '@supabase/supabase-js';

// Essas chaves virão do arquivo .env (vamos criar no próximo passo)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);