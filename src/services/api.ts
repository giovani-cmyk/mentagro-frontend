import { createClient } from '@supabase/supabase-js';

// Colocamos as chaves direto aqui para testar
const url = 'https://zddovgcgmjznhlgzehzi.supabase.co';
const key = 'sb_publishable_1nTzm2xbNz_9DJ1za5KLdA_onfNzLCS';

console.log("Tentando conectar no Supabase com:", url); // Vai aparecer no console do navegador

export const supabase = createClient(url, key);