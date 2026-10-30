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
Corrige con rigor pero con justicia, y sin reescribir el estilo del alumno más de lo necesario. Mide al alumno con el listón de SU nivel (${level}), no con el de un nativo: un texto comprensible, con gramática básica correcta y que cumple el tema debe puntuar bien (70 o más); las notas bajas son para textos con errores que impiden entender o con muchos fallos de gramática básica.
Distingue dos listas:
- "errors": SOLO lo que es incorrecto de verdad (partícula equivocada u omitida, conjugación errónea, vocabulario mal usado, kanji o kana mal escritos, frases que no se entienden). Solo esto resta nota.
- "tips": mejoras opcionales que NO restan nota: alternativas igual de naturales que prefieres, estilo, registro, usar kanji en vez de hiragana, vocabulario más rico.
Reglas importantes:
- Escribir en hiragana una palabra que normalmente lleva kanji NO es un error, aunque el kanji sea más habitual; mucho menos si el significado se entiende por el contexto o si el alumno ya escribió esa palabra con kanji antes en el texto. Si acaso, va en "tips". Solo es error si el kana elegido es otra palabra, es ambiguo de verdad o está mal escrito.
- No marques como error construcciones que son igual de naturales (por ejemplo それは / それが según el contexto, 町 / 市 / 街 al hablar de una ciudad). Si prefieres una, ponla en "tips".
- La puntuación (usar . o , latinos en lugar de 。 y 、) y los espacios sobrantes NO son errores: dependen del teclado. Van en "tips" y no restan nota.
- Antes de marcar un fragmento como error, piensa qué quería decir el alumno: lo escrito en hiragana puede ser una palabra con kanji (por ejemplo やから puede ser 屋から, し puede ser 市). Corrige lo que de verdad esté mal, no lo que sea solo una grafía distinta.
- No inventes errores donde no los hay. Si dudas de si algo es error, ponlo en "tips" o no lo menciones.
Responde SOLO con JSON válido:
{"score":0-100,"comment":"valoración breve en español: qué hace bien, qué debe trabajar, si cumple el tema y usa las estructuras pedidas","errors":[{"orig":"fragmento tal cual lo escribió","fix":"fragmento corregido","why":"explicación corta en español","kind":"gramatica|vocabulario|kanji|escritura","point":"si kind es gramatica: nombre corto del punto gramatical en japonés tal como se busca en un libro de gramática (p. ej. 〜ている, 〜たら, は/が, 敬語); en otro caso, la palabra o el kanji correcto"}],"tips":[{"orig":"fragmento (puede ir vacío)","fix":"alternativa sugerida","why":"explicación corta en español"}],"corrected":"el texto completo corregido y natural, mismo contenido (conserva el hiragana del alumno si no era un error)","level":"nivel JLPT que aparenta el texto (N5-N1)"}
Criterios de la nota: gramática (40), naturalidad y vocabulario (30), adecuación al tema y a la longitud (20), uso de las estructuras pedidas (10).
Texto del alumno:
${text}`;
    const parsed = extractJson(await askClaude(prompt, 6000));
    parsed.score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    return json(parsed);
  } catch (e) { return json({ error: String(e) }, 500); }
});
