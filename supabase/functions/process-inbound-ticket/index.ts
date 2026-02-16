import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    try {
        const rawText = await req.text();
        let payload: any = {};
        try { payload = JSON.parse(rawText); } catch (e) { }

        // Extração do E-mail
        const rawFrom = payload?.data?.from || payload?.email || "";
        let email = rawFrom;
        if (rawFrom.includes("<")) {
            email = rawFrom.match(/<(.+)>/)?.[1] || rawFrom;
        }
        email = email.trim();

        const subject = payload?.data?.subject || payload?.subject || "Sem assunto";
        const body_text = payload?.data?.text || payload?.data?.html || payload?.body_text || "Mensagem vazia";

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const shopifyStore = Deno.env.get('SHOPIFY_STORE_URL');
        const shopifyToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
        const geminiKey = Deno.env.get('GEMINI_API_KEY');
        const resendKey = 're_8KfdMS8r_LMW8aPnPcZYgxZ53QM2RySFo';

        let isCustomer = false;
        let customerData: any = null;
        let ordersData: any[] = [];
        let latestOrderId = null;

        // BUSCA NO SHOPIFY
        if (shopifyStore && shopifyToken) {
            try {
                const shopifyRes = await fetch(`https://${shopifyStore}/admin/api/2024-01/customers/search.json?query=email:${email}`, {
                    headers: { 'X-Shopify-Access-Token': shopifyToken }
                });

                if (shopifyRes.ok) {
                    const data = await shopifyRes.json();
                    if (data.customers && data.customers.length > 0) {
                        isCustomer = true;
                        customerData = data.customers[0];

                        const ordersRes = await fetch(`https://${shopifyStore}/admin/api/2024-01/customers/${customerData.id}/orders.json?status=any`, {
                            headers: { 'X-Shopify-Access-Token': shopifyToken }
                        });
                        if (ordersRes.ok) {
                            const oData = await ordersRes.json();
                            ordersData = oData.orders || [];
                        }

                        // Salva dados no banco
                        try {
                            await supabase.from('customers').upsert({
                                id: customerData.id.toString(),
                                name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || 'Cliente',
                                email: email,
                                avatar: `https://ui-avatars.com/api/?name=${customerData.first_name || 'C'}&background=0D8ABC&color=fff`,
                                sentiment: 'NEUTRAL'
                            });
                            if (ordersData.length > 0) {
                                latestOrderId = ordersData[0].id.toString();
                                const mappedOrders = ordersData.map(o => ({
                                    id: o.id.toString(),
                                    store_name: shopifyStore.split('.')[0].toUpperCase(),
                                    customer_id: customerData.id.toString(),
                                    status: o.fulfillment_status ? 'ENVIADO' : 'PROCESSANDO',
                                    tracking: o.fulfillments?.[0]?.tracking_number || 'Aguardando rastreio'
                                }));
                                await supabase.from('orders').upsert(mappedOrders);
                            }
                        } catch (e) { }
                    }
                }
            } catch (err) { }
        }

        let ticketStatus = 'OPEN';
        let iaSummary = "Transbordo Manual: Cliente não encontrado.";
        let iaFullReply = "";

        if (isCustomer && geminiKey) {
            let customRules = "";
            try {
                const { data: settingsData } = await supabase.from('settings').select('bot_prompt').eq('id', 1).single();
                if (settingsData && settingsData.bot_prompt) {
                    const promptConfig = typeof settingsData.bot_prompt === 'string' ? JSON.parse(settingsData.bot_prompt) : settingsData.bot_prompt;
                    const defaultRules = promptConfig.padrão?.map((f: any) => `${f.label}: ${f.content}`).join('\n') || '';
                    const customFields = promptConfig.personalizadas?.map((f: any) => `${f.label}: ${f.content}`).join('\n') || '';
                    customRules = `REGRAS DE ATENDIMENTO DA EMPRESA:\n${defaultRules}\n${customFields}`;
                }
            } catch (e) { }

            const ordersInfo = ordersData.length > 0
                ? ordersData.map(o => `Pedido: ${o.name} | Pgto: ${o.financial_status} | Status Envio: ${o.fulfillment_status || 'Não enviado'} | Rastreio: ${o.fulfillments?.[0]?.tracking_number || 'Sem rastreio'}`).join('\n')
                : "Nenhum pedido atrelado a este cliente.";

            // 🔥 PROMPT COM NOVAS REGRAS DE FORMATAÇÃO E TAMANHO
            const prompt = `
                Você é um agente de suporte de excelência. O cliente ${customerData?.first_name || ''} enviou esta mensagem: "${body_text}".
                
                DADOS REAIS DO SISTEMA (PEDIDOS DO CLIENTE):
                ${ordersInfo}

                ${customRules}

                REGRAS ABSOLUTAS DE SEGURANÇA E CONDUTA:
                1. NUNCA invente prazos de entrega, processamento, separação ou postagem.
                2. NUNCA invente códigos de rastreio. Se constar "Sem rastreio", informe que o código ainda será gerado.
                3. SE a mensagem do cliente estiver vazia ou for muito curta, peça gentilmente para ele detalhar a dúvida e, proativamente, resuma os status dos pedidos dele baseando-se ESTRITAMENTE nos "DADOS REAIS" acima.
                4. SEJA LITERAL E DIRETO. Não presuma políticas da loja.
                5. PROIBIDO USAR MARKDOWN: Nunca use asteriscos (* ou **) para negrito, nem listas complexas. Escreva a resposta em texto plano, limpo e direto.
                6. SEJA CONCISO E RESUMIDO: Vá direto ao ponto. Não escreva textos longos ou redundantes. O cliente quer uma resposta rápida e clara.

                Sua tarefa:
                Escreva a resposta e retorne EXATAMENTE no formato JSON abaixo:
                {"resumo": "Breve resumo da situação", "resposta_completa": "Sua resposta final em texto plano e curto"}
            `;

            try {
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    const aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : "{}";

                    try {
                        const aiResult = JSON.parse(cleanJson);
                        iaSummary = aiResult.resumo || "IA gerou a resposta automática.";
                        iaFullReply = aiResult.resposta_completa;
                        ticketStatus = 'WAITING'; // Deixa em espera

                        // 🔥 DISPARO AUTOMÁTICO OFICIAL DO E-MAIL
                        if (resendKey) {
                            console.log("Tentando disparar e-mail via Resend...");
                            const resendCall = await fetch('https://api.resend.com/emails', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    from: 'Suporte Mentagro <support@empireclubks.com>',
                                    to: email,
                                    subject: `Re: ${subject || 'Seu Atendimento'}`,
                                    text: iaFullReply
                                })
                            });

                            const resendResponseText = await resendCall.text();
                            console.log("Resposta do Resend:", resendResponseText);
                        }
                    } catch (e: any) {
                        ticketStatus = 'OPEN';
                        iaSummary = `Transbordo: IA falhou ao formatar a resposta.`;
                    }
                }
            } catch (e: any) {
                ticketStatus = 'OPEN';
            }
        }

        // CRIAÇÃO DO TICKET
        const ticketPayload: any = { customer_email: email, subject: subject, messages: iaSummary, status: ticketStatus, priority: isCustomer ? 'MEDIUM' : 'LOW' };
        if (latestOrderId) ticketPayload.order_id = latestOrderId;

        let ticketRecord;
        try {
            const { data, error: dbError } = await supabase.from('tickets').insert([ticketPayload]).select().single();
            if (dbError) throw dbError;
            ticketRecord = data;
        } catch (e) {
            delete ticketPayload.order_id;
            const { data } = await supabase.from('tickets').insert([ticketPayload]).select().single();
            ticketRecord = data;
        }

        // HISTÓRICO DE MENSAGENS NO APP
        if (ticketRecord) {
            try {
                await supabase.from('interactions').insert([{ ticket_id: ticketRecord.id, sender: 'CLIENT', message: body_text }]);
                if (ticketStatus === 'WAITING' && iaFullReply) {
                    await supabase.from('interactions').insert([{ ticket_id: ticketRecord.id, sender: 'AI', message: iaFullReply }]);
                }
            } catch (e) { }
        }

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }, status: 200 });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { headers: { "Content-Type": "application/json" }, status: 500 });
    }
});