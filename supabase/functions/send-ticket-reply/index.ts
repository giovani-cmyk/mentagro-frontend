import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { ticket_id, message, customer_email, subject } = await req.json()
    const resendKey = Deno.env.get('RESEND_API_KEY')

    // Dispara o e-mail real via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Suporte Mentagro <support@empireclubks.com>',
        to: customer_email,
        subject: `Re: ${subject || 'Seu Atendimento'}`,
        text: message
      })
    })

    if (!resendRes.ok) throw new Error("Falha ao enviar e-mail pelo Resend")

    // Salva a mensagem no histórico do banco e atualiza ticket
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('interactions').insert([{ ticket_id, sender: 'SYSTEM', message }]);
    await supabase.from('tickets').update({ status: 'IN_PROGRESS' }).eq('id', ticket_id);

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 })
  }
})