// Corrige una redacción en japonés: ver pipeline.ts. Nota por fórmula fija y resultados guardados por hash.
import { createClient } from "npm:@supabase/supabase-js@2";
import { cors, json, requireUser, askClaude, extractJson, cleanLevel, strList } from "../_shared.ts";
import { grade } from "./pipeline.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await requireUser(req); if (!user) return json({ error: "sin sesión" }, 401);
    const body = await req.json();
    const text = body.text, level = cleanLevel(body.level), use = strList(body.use, 4, 60);
    const topic = typeof body.topic === "string" ? body.topic.slice(0, 300) : "";
    if (!text || typeof text !== "string" || text.length < 20 || text.length > 6000) return json({ error: "texto vacío o demasiado largo (máx. 6000 caracteres)" }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const deps = {
      ask: async (prompt: string, max: number) => extractJson(await askClaude(prompt, max)),
      // La caché es opcional: si la tabla no existe todavía, la función sigue funcionando sin ella
      cacheGet: async (hash: string) => { try { const { data } = await admin.from("write_results").select("result").eq("hash", hash).maybeSingle(); return data ? data.result : null; } catch (_) { return null; } },
      cachePut: async (hash: string, result: unknown) => { try { await admin.from("write_results").upsert({ hash, result }); } catch (_) { /* sin caché */ } },
    };
    const result = await grade({ text, level, topic, use, min: Number(body.min) || 0 }, deps);
    return json(result);
  } catch (e) { return json({ error: String(e) }, 500); }
});
