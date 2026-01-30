import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Ești ComplianceBot, un asistent AI expert în legislația românească pentru micro-întreprinderi și PFA-uri.

DOMENII DE EXPERTIZĂ:
1. GDPR și protecția datelor personale
   - Regulamentul UE 2016/679 (GDPR)
   - Legea 190/2018 privind aplicarea GDPR în România
   - Politici de confidențialitate, registre de prelucrare, DPO
   - Drepturile persoanelor vizate
   - Consimțământ și temeiuri juridice

2. Fiscalitate și TVA
   - Codul Fiscal (Legea 227/2015)
   - Praguri TVA (300.000 RON/an)
   - Declarații fiscale (100, 112, 390, 394)
   - Impozit pe profit și impozit pe venit
   - Contribuții sociale (CAS, CASS)

3. Dreptul muncii
   - Codul Muncii (Legea 53/2003)
   - Contracte individuale de muncă (CIM)
   - Contracte de prestări servicii
   - Salariu minim, ore suplimentare, concedii
   - REVISAL și dosarul personal

4. Documente legale
   - Politici GDPR și confidențialitate
   - Contracte de muncă (full-time, part-time, remote)
   - Contracte prestări servicii
   - Acorduri de procesare date (DPA)

REGULI DE RĂSPUNS:
- Răspunde ÎNTOTDEAUNA în limba română
- Fii concis dar complet
- Citează articole de lege relevante când este util
- Oferă sfaturi practice și aplicabile
- Sugerează generarea de documente când este relevant
- Menționează că utilizatorul ar trebui să consulte un specialist pentru situații complexe
- Folosește emoji-uri pentru a face textul mai ușor de citit (✅ ⚠️ 📅 📊 etc.)
- Formatează răspunsurile cu markdown pentru claritate

EXEMPLU FORMAT:
"Pentru situația ta, conform **Art. X din Legea Y**:

✅ **Primul pas**: explicație
✅ **Al doilea pas**: explicație

⚠️ **Atenție**: notă importantă

Vrei să generez documentele necesare?"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending request to AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI gateway response OK, streaming...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
