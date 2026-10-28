// Convierte un texto japonés pegado por el usuario en una lectura glosada (furigana, glosario, traducción, preguntas).
import { cors, json, requireUser, askClaude, extractJson } from "../_shared.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const user = await requireUser(req); if (!user) return json({ error: "sin sesión" }, 401);
    const { text, title, level } = await req.json();
    if (!text || typeof text !== "string" || text.length > 6000) return json({ error: "texto vacío o demasiado largo (máx. 6000 caracteres)" }, 400);
    const prompt = `Eres profesor de japonés para un hispanohablante de nivel JLPT ${level || "N4"}. Convierte el siguiente texto japonés en material de lectura. Responde SOLO con JSON válido con esta forma:
{"title":"título corto","sub":"descripción de una línea en español","t":"TEXTO TOKENIZADO","es":"traducción completa al español, natural","q":[{"q":"pregunta de comprensión en japonés sencillo","o":["opción","opción","opción","opción"],"a":0}],"notes":["punto gramatical relevante: explicación de una frase"]}
Formato de "t": reproduce el texto ÍNTEGRO y en el mismo orden. Cada palabra con contenido (sustantivos, verbos, adjetivos, adverbios, expresiones) va como [superficie|lectura en hiragana|glosa breve en español]; las partículas, puntuación y palabras solo en kana muy básicas (は, が, を, です, ます…) van fuera de corchetes tal cual. Conjuga la glosa según la forma (p. ej. [食べました|たべました|comer (pasado)]). Los saltos de párrafo como \\n. Tres preguntas en "q", con "a" el índice de la correcta.
Texto:
${text}`;
    const parsed = extractJson(await askClaude(prompt, 16000));
    if (title) parsed.title = title;
    return json(parsed);
  } catch (e) { return json({ error: String(e) }, 500); }
});
