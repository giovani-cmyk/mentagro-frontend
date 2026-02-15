import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
    console.log("🚀 Function started!");

    try {
        const rawText = await req.text();
        console.log("📦 Raw payload received:", rawText);

        let payload;
        try {
            payload = JSON.parse(rawText);
        } catch (err) {
            console.error("❌ JSON Parse Error:", err);
            return new Response("Invalid JSON", { status: 400 });
        }

        // ==========================================
        // 1. EXTRAÇÃO DE DADOS (Formato Resend)
        // ==========================================
        const rawFrom = payload?.data?.from || payload?.email || "";
        const email = rawFrom.match(/<(.+)>/)?.[1] || rawFrom || "desconhecido@email.com";
        const subject = payload?.data?.subject || payload?.subject || "Sem assunto";

        // Suporta e-mails em texto plano ou HTML
        const body_text = payload?.data?.text || payload?.data?.html || payload?.body_text || "Mensagem vazia";
        console.log(`📧 Email parsed. From: ${email}, Subject: ${subject}`);

        // ==========================================
        // 2. CONSULTA NO SHOPIFY
        // ==========================================
        console.log("🛍️ Checking Shopify for customer...");
        const shopifyStore = Deno.env.get('SHOPIFY_STORE_URL');
        const shopifyToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

        if (shopifyStore && shopifyToken) {
            try {
                const shopifyRes = await fetch(`https://${shopifyStore}/admin/api/2024-01/customers/search.json?query=email:${email}`, {
                    headers: { 'X-Shopify-Access-Token': shopifyToken }
                });

                if (shopifyRes.ok) {
                    const shopifyData = await shopifyRes.json();
                    if (shopifyData.customers && shopifyData.customers.length > 0) {
                        console.log(`✅ Shopify Customer Found: ${shopifyData.customers[0].first_name}`);
                    } else {
                        console.log("⚠️ Customer not found in Shopify.");
                    }
                } else {
                    console.error("❌ Shopify API Error:", await shopifyRes.text());
                }
            } catch (shopErr) {
                console.error("❌ Shopify Fetch Error:", shopErr);
                // Não usamos 'throw' aqui. Se o Shopify falhar, o ticket ainda deve ser criado.
            }
        } else {
            console.log("⚠️ Shopify credentials missing. Skipping.");
        }

        // ==========================================
        // 3. ANÁLISE COM O GEMINI (IA)
        // ==========================================
        console.log("🧠 Calling Gemini...");
        const geminiKey = Deno.env.get('GEMINI_API_KEY');
        const prompt = `Resuma este e-mail em uma frase curta e defina a urgência (ALTA, MEDIA, BAIXA). E-mail: "${body_text}"`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error("❌ Gemini API Error:", errText);
            throw new Error("Gemini API failed");
        }

        const geminiData = await geminiRes.json();
        const iaSummary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Resumo indisponível";
        console.log("🤖 Gemini Success:", iaSummary);

        // Define o status inteligente baseado na resposta da IA
        const ticketStatus = iaSummary.includes('ALTA') ? 'PENDING_HUMAN' : 'OPEN';

        // ==========================================
        // 4. SALVAMENTO NO BANCO (SUPABASE)
        // ==========================================
        console.log("💾 Saving to database...");
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error: dbError } = await supabase
            .from('tickets')
            .insert([{
                customer_email: email,
                subject: subject,
                messages: iaSummary,
                status: ticketStatus
            }]);

        if (dbError) {
            console.error("❌ DB Insert Error:", dbError);
            throw dbError;
        }

        console.log("✅ All done successfully!");
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }, status: 200 });

    } catch (error: any) {
        console.error("🔥 CRITICAL ERROR:", error.message || error);
        return new Response(JSON.stringify({ error: error.message }), { headers: { "Content-Type": "application/json" }, status: 500 });
    }
});