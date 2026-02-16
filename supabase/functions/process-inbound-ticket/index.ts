import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    console.log("🚀 Iniciando processamento do e-mail...");

    try {
        const rawText = await req.text();
        let payload;
        try {
            payload = JSON.parse(rawText);
        } catch (err) {
            return new Response("Invalid JSON", { status: 400 });
        }

        // 1. EXTRAÇÃO DO E-MAIL
        const rawFrom = payload?.data?.from || payload?.email || "";
        const email = rawFrom.match(/<(.+)>/)?.[1] || rawFrom || "desconhecido@email.com";
        const subject = payload?.data?.subject || payload?.subject || "Sem assunto";
        const body_text = payload?.data?.text || payload?.data?.html || payload?.body_text || "";

        // Inicializando o Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. BUSCA NO SHOPIFY (Identifica se é cliente)
        const shopifyStore = Deno.env.get('SHOPIFY_STORE_URL');
        const shopifyToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
        let isCustomer = false;
        let customerData = null;

        if (shopifyStore && shopifyToken) {
            const shopifyRes = await fetch(`https://${shopifyStore}/admin/api/2024-01/customers/search.json?query=email:${email}`, {
                headers: { 'X-Shopify-Access-Token': shopifyToken }
            });

            if (shopifyRes.ok) {
                const data = await shopifyRes.json();
                if (data.customers && data.customers.length > 0) {
                    isCustomer = true;
                    customerData = data.customers[0];
                    console.log(`✅ Cliente encontrado: ${customerData.first_name}`);
                }
            }
        }

        let ticketStatus = 'OPEN'; // Padrão: Transbordo / Em Aberto
        let iaSummary = "E-mail de não-cliente ou dúvida geral. Direcionado para atendimento manual.";
        let iaFullReply = "";

        // 3. LÓGICA DO FLUXOGRAMA
        if (!isCustomer) {
            // CAMINHO A: Não é cliente -> Transbordo Manual
            console.log("⚠️ Não é cliente. Direcionando para transbordo humano (OPEN).");
            ticketStatus = 'OPEN';
        } else {
            // CAMINHO B: É cliente -> IA assume o atendimento
            console.log("🧠 Cliente identificado. Acionando Agente Gemini...");
            const geminiKey = Deno.env.get('GEMINI_API_KEY');

            const prompt = `
                Você é um agente de suporte ao cliente de uma loja.
                O cliente ${customerData.first_name} enviou a seguinte mensagem: "${body_text}".
                
                Sua tarefa:
                1. Identifique se ele quer saber ONDE ESTÁ O PEDIDO (Rastreio) ou CANCELAR O PEDIDO.
                2. Escreva uma resposta educada e final para o cliente (em português).
                3. Retorne EXATAMENTE no formato JSON abaixo, sem usar formatação markdown ou blocos de código:
                {"resumo": "Uma frase resumindo o que ele quer", "resposta_completa": "Sua resposta educada como atendente"}
            `;

            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                const aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

                try {
                    // Limpa o texto da IA caso ela mande blocos markdown ```json
                    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
                    const aiResult = JSON.parse(cleanJson);

                    iaSummary = aiResult.resumo || "IA gerou a resposta.";
                    iaFullReply = aiResult.resposta_completa;
                    ticketStatus = 'RESOLVED'; // Como a IA respondeu, vai para Concluído
                    console.log("✅ IA gerou a resposta e resolveu o ticket.");
                } catch (e) {
                    console.error("Erro ao ler JSON da IA, caindo para transbordo.");
                    ticketStatus = 'OPEN';
                }
            }
        }

        // 4. CRIAR O TICKET NO BANCO
        console.log("💾 Salvando Ticket...");
        const { data: ticketRecord, error: dbError } = await supabase
            .from('tickets')
            .insert([{
                customer_email: email,
                subject: subject,
                messages: iaSummary,
                status: ticketStatus, // Vai ser OPEN ou RESOLVED baseado no fluxo
                priority: isCustomer ? 'MEDIUM' : 'LOW'
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        // 5. SE A IA RESPONDEU, SALVA A MENSAGEM NO CHAT (INTERACTIONS)
        if (ticketStatus === 'RESOLVED' && iaFullReply) {
            console.log("💾 Salvando resposta da IA no histórico...");
            await supabase.from('interactions').insert([{
                ticket_id: ticketRecord.id,
                sender: 'AI',
                message: iaFullReply
            }]);
        }

        console.log("✅ Tudo finalizado com sucesso!");
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }, status: 200 });

    } catch (error: any) {
        console.error("🔥 ERRO CRÍTICO:", error);
        return new Response(JSON.stringify({ error: error.message }), { headers: { "Content-Type": "application/json" }, status: 500 });
    }
});