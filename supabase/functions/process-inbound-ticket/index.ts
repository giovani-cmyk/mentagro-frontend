// deno-lint-ignore-file
declare const Deno: {
    serve(handler: (req: Request) => Promise<Response> | Response): void;
    env: {
        get(key: string): string | undefined;
    };
};

import { createClient } from "supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { customer_email, subject, body_text, date } = await req.json();

        if (!customer_email || !body_text) {
            throw new Error("Missing required fields: customer_email or body_text");
        }

        // 1. Shopify Integration
        const shopifyUrl = Deno.env.get('SHOPIFY_STORE_URL');
        const shopifyAccessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
        let orderNumber = null;
        let totalPrice = null;

        if (shopifyUrl && shopifyAccessToken) {
            try {
                const shopifyResponse = await fetch(`${shopifyUrl}/admin/api/2024-01/customers/search.json?query=email:${customer_email}`, {
                    headers: {
                        'X-Shopify-Access-Token': shopifyAccessToken,
                        'Content-Type': 'application/json',
                    },
                });

                if (shopifyResponse.ok) {
                    const shopifyData = await shopifyResponse.json();
                    const customer = shopifyData.customers?.[0];

                    if (customer) {
                        // Fetch last order for this customer if needed, or use existing data if available on customer object
                        // For simplicity, let's assume we want the last order from the customer's order list if available,
                        // or we might need a separate call to /orders.json?customer_id=...
                        // The customer object from search might has 'last_order_id', but to get number and price we might need to fetch the order.
                        // Let's try to fetch the latest order for this customer.
                        const ordersResponse = await fetch(`${shopifyUrl}/admin/api/2024-01/customers/${customer.id}/orders.json?status=any&limit=1`, {
                            headers: {
                                'X-Shopify-Access-Token': shopifyAccessToken,
                                'Content-Type': 'application/json',
                            },
                        });
                        if (ordersResponse.ok) {
                            const ordersData = await ordersResponse.json();
                            const lastOrder = ordersData.orders?.[0];
                            if (lastOrder) {
                                orderNumber = lastOrder.order_number;
                                totalPrice = lastOrder.total_price;
                            }
                        }
                    }
                } else {
                    console.error("Shopify API Error:", await shopifyResponse.text());
                }

            } catch (error) {
                console.error("Shopify Integration Error:", error);
            }
        }

        // 2. Google Gemini Integration
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        let summary = "Resumo indisponível";
        let urgency = "Média";

        if (geminiApiKey) {
            try {
                const genAI = new GoogleGenerativeAI(geminiApiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const prompt = `
          Analise o seguinte e-mail de um cliente e retorne um objeto JSON com duas propriedades:
          1. "summary": Um resumo do problema ou solicitação em um parágrafo curto.
          2. "urgency": Uma classificação de urgência (Baixa, Média, Alta) baseada no tom e conteúdo.

          E-mail:
          ${body_text}
          
          Responda APENAS com o JSON válido.
        `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                // Text parsing logic to extract clean JSON
                let text = response.text();
                // Remove markdown code blocks if present
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();

                try {
                    const analysis = JSON.parse(text);
                    summary = analysis.summary || summary;
                    urgency = analysis.urgency || urgency;
                } catch (e) {
                    console.error("Failed to parse Gemini response as JSON:", text);
                    // Fallback: simple text extraction if JSON fails, or just keep defaults.
                }

            } catch (error) {
                console.error("Gemini Integration Error:", error);
            }
        }

        // 3. Database Insertion
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // We assume 'SUPABASE_URL' and 'SUPABASE_SERVICE_ROLE_KEY' are standard, 
        // but in Edge Functions usually Deno.env.get('SUPABASE_URL') and 'SUPABASE_ANON_KEY' or 'SUPABASE_SERVICE_ROLE_KEY' work.
        // For inserting we might need service role if RLS prevents anon inserts or if we want to bypass it.

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: insertedData, error: insertError } = await supabase
            .from('tickets')
            .insert([
                {
                    email: customer_email,
                    subject: subject,
                    description: body_text,
                    status: 'open',
                    priority: urgency,
                    ai_summary: summary,   // Adjusted column name based on likely schema or new column
                    shopify_order_id: orderNumber,
                    shopify_total_spent: totalPrice,
                    created_at: date ? new Date(date).toISOString() : new Date().toISOString(),
                    source: 'email'
                },
            ])
            .select();

        if (insertError) {
            console.error("Insert Error:", insertError);
            throw new Error(`Failed to insert ticket: ${insertError.message}`);
        }

        return new Response(
            JSON.stringify({ success: true, ticket: insertedData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );

    } catch (err: any) {
        console.error("Function Error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }
});
