// Genera preguntas de examen con frases inéditas a partir de lo que el usuario ha aprendido.
import { cors, json, requireUser, askClaude, extractJson } from "../_shared.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await requireUser(req); if (!user) return json({ error: "sin sesión" }, 401);
    const { vocab, grammar, kanji, counts, level } = await req.json();
    if (!Array.isArray(vocab) || !Array.isArray(grammar)) return json({ error: "faltan datos" }, 400);
    const n = Object.assign({ kr: 6, or: 4, ctx: 5, gr: 6, prod: 6 }, counts || {});
    const prompt = `Eres examinador del JLPT ${level || "N4"}. Crea preguntas NUEVAS para un hispanohablante usando SOLO este material aprendido (puedes usar además partículas, です/ます, kana básico y palabras muy comunes de N5). No repitas frases de libro de texto; escribe frases naturales, variadas (diálogo, aviso, correo, narración) y de dificultad real de examen.
Vocabulario aprendido (palabra/lectura): ${vocab.slice(0, 250).join(", ")}
Kanji aprendidos: ${(kanji || []).slice(0, 300).join("")}
Gramática aprendida: ${grammar.slice(0, 120).join(" | ")}
Responde SOLO con JSON válido:
{"qs":[
 {"sec":"漢字読み","text":"frase con la palabra objetivo","under":"palabra objetivo tal como aparece en la frase","options":["lectura correcta","distractor","distractor","distractor"],"answer":"lectura correcta","es":"traducción"},
 {"sec":"表記","text":"frase con la palabra objetivo escrita en hiragana","under":"la palabra en hiragana","options":["escritura correcta en kanji","kanji parecido","kanji parecido","kanji parecido"],"answer":"escritura correcta","es":"traducción"},
 {"sec":"文脈規定","text":"frase con （　　） en el hueco","options":["palabra correcta","distractor plausible","distractor","distractor"],"answer":"palabra correcta","es":"traducción"},
 {"sec":"文法形式","text":"frase con （　　） donde falta la forma gramatical","options":["forma correcta","distractor","distractor","distractor"],"answer":"forma correcta","es":"traducción","point":"punto gramatical"},
 {"sec":"producción","es":"frase corta en español para traducir","answer":"traducción japonesa en kana (sin kanji)","alt":["otra traducción válida en kana"]}
]}
Cantidades: ${n.kr} de 漢字読み, ${n.or} de 表記, ${n.ctx} de 文脈規定, ${n.gr} de 文法形式 (cada una de un punto gramatical distinto), ${n.prod} de producción (frases de 3 a 6 palabras que se puedan escribir solo con el vocabulario aprendido). Los distractores deben ser plausibles (lecturas con rendaku, vocal larga o っ cambiados; kanji con componentes parecidos; formas gramaticales del mismo grupo). En "options" el orden debe ser aleatorio.`;
    const parsed = extractJson(await askClaude(prompt, 12000));
    return json(parsed);
  } catch (e) { return json({ error: String(e) }, 500); }
});
