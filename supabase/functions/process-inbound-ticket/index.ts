// deno-lint-ignore-file
declare const Deno: {
    serve(handler: (req: Request) => Promise<Response> | Response): void;
    env: { get(key: string): string | undefined };
};

import { createClient } from "supabase";

// ─── CORS Headers ───────────────────────────────────────────────
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

// ─── Helper: map Portuguese urgency → DB priority ───────────────
function mapPriority(urgency: string): "HIGH" | "MEDIUM" | "LOW" {
    const u = urgency.trim().toUpperCase();
    if (u === "ALTA") return "HIGH";
    if (u === "BAIXA") return "LOW";
    return "MEDIUM";
}

// ─── Helper: pick initial status based on urgency ───────────────
function pickStatus(priority: "HIGH" | "MEDIUM" | "LOW"): string {
    return priority === "HIGH" ? "PENDING_HUMAN" : "OPEN";
}

// ─── Main Handler ───────────────────────────────────────────────
Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // ── 1. Receive & Parse Payload (Robust) ─────────────────────
        const rawText = await req.text();
        console.log("Incoming Raw Payload:", rawText);

        let payload;
        try {
            payload = JSON.parse(rawText);
        } catch (e) {
            console.error("JSON Parse Error. Raw text was:", rawText);
            return new Response(
                JSON.stringify({ error: "Invalid JSON payload" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        // Safely extract data, supporting both Resend webhook and direct mock formats
        const rawFrom = payload?.data?.from || payload?.email || "";
        const customer_email = rawFrom.match(/<(.+)>/)?.[1] || rawFrom || "desconhecido@email.com";
        const subject = payload?.data?.subject || payload?.subject || "Sem assunto";
        const body_text = payload?.data?.text || payload?.body_text || "Mensagem vazia";
        const date = payload?.data?.created_at || payload?.date;

        if (!customer_email || body_text === "Mensagem vazia") {
            return new Response(
                JSON.stringify({ error: "Missing required fields in payload" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }
        // ── 2. Shopify Integration ──────────────────────────────────
        const shopifyUrl = Deno.env.get("SHOPIFY_STORE_URL");
        const shopifyToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
        let customerName: string | null = null;
        let orderNumber: string | null = null;

        if (shopifyUrl && shopifyToken) {
            try {
                const searchUrl =
                    `https://${shopifyUrl}/admin/api/2024-01/customers/search.json?query=email:${customer_email}`;

                const shopRes = await fetch(searchUrl, {
                    headers: {
                        "X-Shopify-Access-Token": shopifyToken,
                        "Content-Type": "application/json",
                    },
                });

                if (shopRes.ok) {
                    const shopData = await shopRes.json();
                    const customer = shopData.customers?.[0];

                    if (customer) {
                        customerName = customer.first_name || null;

                        // Fetch latest order for this customer
                        const ordersUrl =
                            `https://${shopifyUrl}/admin/api/2024-01/customers/${customer.id}/orders.json?status=any&limit=1`;

                        const ordersRes = await fetch(ordersUrl, {
                            headers: {
                                "X-Shopify-Access-Token": shopifyToken,
                                "Content-Type": "application/json",
                            },
                        });

                        if (ordersRes.ok) {
                            const ordersData = await ordersRes.json();
                            const lastOrder = ordersData.orders?.[0];
                            if (lastOrder) {
                                orderNumber = String(lastOrder.order_number);
                            }
                        }
                    }
                } else {
                    console.error("Shopify API Error:", await shopRes.text());
                }
            } catch (err) {
                console.error("Shopify Integration Error:", err);
            }
        }

        // ── 3. Google Gemini Integration (raw REST) ─────────────────
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        let summary = "Resumo indisponível";
        let urgency = "MEDIA";

        if (geminiKey) {
            try {
                const geminiUrl =
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`;

                const geminiRes = await fetch(geminiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `Resuma este e-mail de suporte em um parágrafo curto e classifique a urgência (ALTA, MEDIA, BAIXA).

Responda APENAS com um JSON válido no formato:
{"summary": "...", "urgency": "ALTA|MEDIA|BAIXA"}

E-mail:
${body_text}`,
                                    },
                                ],
                            },
                        ],
                    }),
                });

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    let text =
                        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

                    // Strip markdown code fences if present
                    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

                    try {
                        const parsed = JSON.parse(text);
                        summary = parsed.summary || summary;
                        urgency = parsed.urgency || urgency;
                        console.log("🤖 Gemini Summary Generated:", summary);
                    } catch {
                        console.error("Failed to parse Gemini response as JSON:", text);
                        // Keep defaults
                    }
                } else {
                    console.error("Gemini API Error:", await geminiRes.text());
                }
            } catch (err) {
                console.error("Gemini Integration Error:", err);
            }
        }

        // ── 4. Database Insertion ───────────────────────────────────
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const priority = mapPriority(urgency);
        const status = pickStatus(priority);

        const { data: ticket, error: insertError } = await supabase
            .from("tickets")
            .insert([
                {
                    subject: subject || "(sem assunto)",
                    status,
                    priority,
                    customer_email,
                    customer_name: customerName,
                    messages: summary,
                    channel: "email",
                    created_at: date ? new Date(date).toISOString() : new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error("❌ DB INSERT ERROR:", insertError);
            throw insertError;
        }

        console.log("✅ SUCCESS: Ticket saved to database!");
        // ── 5. Success Response ─────────────────────────────────────
        return new Response(
            JSON.stringify({ success: true, ticket }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err: any) {
        console.error("🔥 CRITICAL EXECUTION ERROR:", err);
        console.error("Function Error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
