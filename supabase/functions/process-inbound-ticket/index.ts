import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    try {
        const rawText = await req.text();
        let payload: any = {};
        try { payload = JSON.parse(rawText); } catch (e) { }

        // 1. EXTRAÇÃO DE E-MAIL E NOME REAL
        const rawFrom = payload?.from || payload?.data?.from || payload?.email || "";
        let email = rawFrom;
        let name = "Visitante";
        
        if (rawFrom.includes("<")) {
            const match = rawFrom.match(/(.*)<(.+)>/);
            if (match) {
                name = match[1].replace(/"/g, '').trim() || "Visitante";
                email = match[2].trim();
            }
        }
        email = email.trim();

        const subject = payload?.subject || payload?.data?.subject || "Sem assunto";

        // 2. CAPTURA TOTAL DO CORPO DO E-MAIL
        const body_text = (
            payload?.text || 
            payload?.data?.text || 
            payload?.html || 
            payload?.data?.html || 
            payload?.body_text || 
            "Mensagem vazia"
        ).trim();

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const geminiKey = Deno.env.get('GEMINI_API_KEY');
        const resendKey = 're_8KfdMS8r_LMW8aPnPcZYgxZ53QM2RySFo';

        let isCustomer = false;
        let customerData: any = null;
        let ordersData: any[] = [];
        let latestOrderId = null;
        let matchedStoreName = "Dúvida Geral"; // Nome que aparece quando não tem pedido

        // BUSCA NAS LOJAS DO PAINEL
        const { data: storesList } = await supabase.from('stores').select('*');

        if (storesList && storesList.length > 0) {
            for (const store of storesList) {
                const shopifyStore = store.shopify_url;
                const shopifyToken = store.shopify_token;
                
                if (!shopifyStore || !shopifyToken) continue;

                try {
                    const shopifyRes = await fetch(`https://${shopifyStore}/admin/api/2024-01/customers/search.json?query=email:${email}`, {
                        headers: { 'X-Shopify-Access-Token': shopifyToken }
                    });
                    
                    if (shopifyRes.ok) {
                        const data = await shopifyRes.json();
                        if (data.customers && data.customers.length > 0) {
                            isCustomer = true;
                            customerData = data.customers[0];
                            matchedStoreName = store.name;
                            name = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || name;

                            await supabase.from('stores').update({ last_sync: new Date().toISOString() }).eq('id', store.id);

                            const ordersRes = await fetch(`https://${shopifyStore}/admin/api/2024-01/customers/${customerData.id}/orders.json?status=any`, {
                                headers: { 'X-Shopify-Access-Token': shopifyToken }
                            });
                            
                            if (ordersRes.ok) {
                                const oData = await ordersRes.json();
                                ordersData = oData.orders || [];
                            }
                            break; 
                        }
                    }
                } catch (err) {}
            }
        }

        // SALVA O PERFIL (COMPRADOR OU VISITANTE) NO BANCO
        const customerId = isCustomer ? customerData.id.toString() : email;
        try {
            await supabase.from('customers').upsert({
                id: customerId,
                name: name,
                email: email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
                sentiment: 'NEUTRAL'
            });
            
            if (ordersData.length > 0) {
                latestOrderId = ordersData[0].id.toString();
                const mappedOrders = ordersData.map(o => ({
                    id: o.id.toString(),
                    store_name: matchedStoreName,
                    customer_id: customerId,
                    status: o.fulfillment_status ? 'ENVIADO' : 'PROCESSANDO',
                    tracking: o.fulfillments?.[0]?.tracking_number || 'Aguardando rastreio'
                }));
                await supabase.from('orders').upsert(mappedOrders);
            }
        } catch(e) {}

        let ticketStatus = 'OPEN'; 
        let iaSummary = "Processando via IA...";
        let iaFullReply = "";

        // 🔥 A IA AGORA RESPONDE A TODOS (COMPRADORES E VISITANTES)
        if (geminiKey) { 
            let customRules = "";
            try {
                const { data: settingsData } = await supabase.from('settings').select('bot_prompt').eq('id', 1).single();
                if (settingsData && settingsData.bot_prompt) {
                    const promptConfig = typeof settingsData.bot_prompt === 'string' ? JSON.parse(settingsData.bot_prompt) : settingsData.bot_prompt;
                    const defaultRules = promptConfig.padrão?.map((f: any) => `${f.label}: ${f.content}`).join('\n') || '';
                    const customFields = promptConfig.personalizadas?.map((f: any) => `${f.label}: ${f.content}`).join('\n') || '';
                    customRules = `REGRAS DE ATENDIMENTO:\n${defaultRules}\n${customFields}`;
                }
            } catch(e) { }

            const ordersInfo = isCustomer 
                ? (ordersData.length > 0 ? ordersData.map(o => `Pedido: ${o.name} | Pgto: ${o.financial_status} | Status Envio: ${o.fulfillment_status || 'Não enviado'} | Rastreio: ${o.fulfillments?.[0]?.tracking_number || 'Sem rastreio'}`).join('\n') : "Nenhum pedido atrelado a este cliente.")
                : "ALERTA: Este e-mail NÃO está cadastrado na loja (Visitante ou E-mail Diferente). Se ele perguntar de um pedido, avise que não localizou compras com este e-mail e peça gentilmente o CPF ou o número do pedido.";

            const prompt = `
                Você é um agente de suporte de excelência da loja OmniDesk. O usuário ${name} enviou esta mensagem: "${body_text}".
                
                DADOS DO SISTEMA:
                ${ordersInfo}

                ${customRules}

                TAREFA:
                - Responda de forma curta, clara e proativa. 
                - NUNCA invente códigos ou prazos.
                - Proibido usar Markdown (asteriscos). Escreva texto limpo.
                
                Retorne EXATAMENTE no formato JSON:
                {"resumo": "Breve resumo do que foi falado", "resposta_completa": "Sua resposta curta para o cliente"}
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
                        iaSummary = aiResult.resumo;
                        iaFullReply = aiResult.resposta_completa;
                        ticketStatus = 'WAITING';

                        if (resendKey) {
                            await fetch('https://api.resend.com/emails', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    from: 'Suporte Mentagro <support@empireclubks.com>',
                                    to: email,
                                    subject: `Re: ${subject}`,
                                    text: iaFullReply
                                })
                            });
                        }
                    } catch (e) { ticketStatus = 'OPEN'; }
                }
            } catch (e) { ticketStatus = 'OPEN'; }
        }

        const ticketPayload: any = { customer_email: email, subject: subject, messages: iaSummary, status: ticketStatus, priority: isCustomer ? 'MEDIUM' : 'LOW' };
        if (latestOrderId) ticketPayload.order_id = latestOrderId;

        const { data: ticketRecord } = await supabase.from('tickets').insert([ticketPayload]).select().single();

        if (ticketRecord) {
            await supabase.from('interactions').insert([{ ticket_id: ticketRecord.id, sender: 'CLIENT', message: body_text }]);
            if (ticketStatus === 'WAITING' && iaFullReply) {
                await supabase.from('interactions').insert([{ ticket_id: ticketRecord.id, sender: 'AI', message: iaFullReply }]);
            }
        }

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }, status: 200 });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { headers: { "Content-Type": "application/json" }, status: 500 });
    }
});