import { createClient } from '@supabase/supabase-js';

// Colocamos as chaves direto aqui para garantir que funciona
const supabaseUrl = 'https://zddovgcgmjznhlgzehzi.supabase.co';
const supabaseKey = 'sb_publishable_1nTzm2xbNz_9DJ1za5KLdA_onfNzLCS';

export const supabase = createClient(supabaseUrl, supabaseKey);