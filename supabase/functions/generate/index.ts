// Genera el contenido de un nivel N3–N1 con la API de Claude. Requiere el secreto ANTHROPIC_API_KEY.
// Desplegar: supabase secrets set ANTHROPIC_API_KEY=sk-ant-... && supabase functions deploy generate
import { cors, json, requireUser, askClaude, extractJson } from "../_shared.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // Solo usuarios con sesión y autorizados
    const user = await requireUser(req);
    if (!user) return json({ error: "sin sesión" }, 401);
    const { lv, prompt } = await req.json();
    if (!Number.isInteger(lv) || lv < 14 || lv > 103) return json({ error: "nivel no válido" }, 400);
    // Solo se acepta el prompt que construye la app para ese nivel (no un prompt libre)
    if (!prompt || typeof prompt !== "string" || prompt.length > 20000 || !prompt.startsWith(`Eres un profesor de japonés. Genera el contenido del nivel ${lv} (JLPT `)) return json({ error: "prompt no válido" }, 400);
    const parsed = extractJson(await askClaude(prompt, 16000));
    parsed.lv = lv;
    return json(parsed);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
