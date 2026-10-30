// Utilidades comunes de las funciones
import { createClient } from "npm:@supabase/supabase-js@2";
export const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
// Usuario con sesión válida Y correo autorizado en la tabla allowed_users (consultada con la clave de servidor)
export async function requireUser(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await sb.auth.getUser();
  if (!user || !user.email) return null;
  const email = user.email.toLowerCase();
  const envList = (Deno.env.get("ALLOWED_EMAILS") || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (envList.includes(email)) return user;
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await admin.from("allowed_users").select("email").eq("email", email).maybeSingle();
  return data ? user : null;
}
export async function askClaude(prompt: string, maxTokens = 16000): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("falta la clave del servicio en el servidor");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
  });
  if (!r.ok) throw new Error("Servicio no disponible (" + r.status + ")");
  const out = await r.json();
  if (out.stop_reason === "max_tokens") throw new Error("respuesta truncada por longitud; inténtalo otra vez");
  return (out.content || []).map((c: any) => c.text || "").join("");
}
export const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
export const cleanLevel = (l: unknown) => (typeof l === "string" && LEVELS.includes(l)) ? l : "N4";
export const strList = (a: unknown, max: number, maxLen: number) => Array.isArray(a) ? a.filter((s) => typeof s === "string" && s.length <= maxLen).slice(0, max) : [];
export function extractJson(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("respuesta sin JSON");
  return JSON.parse(m[0]);
}
