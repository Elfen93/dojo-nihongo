// Corrige una redacción en japonés: errores, versión natural, nota y comentario en español.
import { cors, json, requireUser, askClaude, extractJson, cleanLevel, strList } from "../_shared.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await requireUser(req); if (!user) return json({ error: "sin sesión" }, 401);
    const body = await req.json();
    const text = body.text, level = cleanLevel(body.level), use = strList(body.use, 4, 60);
    const topic = typeof body.topic === "string" ? body.topic.slice(0, 300) : "";
    if (!text || typeof text !== "string" || text.length < 20 || text.length > 6000) return json({ error: "texto vacío o demasiado largo (máx. 6000 caracteres)" }, 400);
    const prompt = `Eres profesor de japonés y corriges la redacción de un hispanohablante de nivel JLPT ${level}. Tema propuesto: ${topic || "libre"}. Longitud esperada: entre ${Math.max(100, Number(body.min) || 300)} y ${Math.max(150, Number(body.max) || 450)} caracteres (penaliza en la nota si se queda muy corto; no penalices por pasarse un poco). ${use.length ? "Se le pidió usar: " + use.join(", ") + "." : ""}
Corrige con rigor pero sin reescribir el estilo del alumno más de lo necesario. Responde SOLO con JSON válido:
{"score":0-100,"comment":"valoración breve en español: qué hace bien, qué debe trabajar, si cumple el tema y usa las estructuras pedidas","errors":[{"orig":"fragmento tal cual lo escribió","fix":"fragmento corregido","why":"explicación corta en español","point":"nombre corto del punto gramatical o tema que debe estudiar, en japonés tal como se busca en un libro de gramática (p. ej. 〜ている, 〜たら, は/が, 敬語, 自動詞と他動詞); si es solo un kanji mal escrito o vocabulario, pon la palabra correcta"}],"corrected":"el texto completo corregido y natural, mismo contenido","level":"nivel JLPT que aparenta el texto (N5-N1)"}
Criterios de la nota: gramática (40), naturalidad y vocabulario (30), adecuación al tema y a la longitud (20), uso de las estructuras pedidas (10). Lista TODOS los errores reales (partículas, conjugación, kanji mal usado, registro); no inventes errores donde no los hay.
Texto del alumno:
${text}`;
    const parsed = extractJson(await askClaude(prompt, 6000));
    parsed.score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    return json(parsed);
  } catch (e) { return json({ error: String(e) }, 500); }
});
