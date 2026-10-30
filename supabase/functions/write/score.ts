// Nota de una redacción calculada con una fórmula fija a partir de los errores confirmados.
// La IA no decide la nota: la misma lista de errores da siempre la misma nota.
export const WEIGHT = { 1: 1, 2: 2, 3: 3 };
export const jaLen = (s) => (String(s || "").match(/[぀-ヿ一-鿿々ー]/g) || []).length;
const FLOOR = 200; // en textos cortos un solo error no debe hundir la nota
export function computeScore(input) {
  const n = Math.max(1, jaLen(input.text));
  const errors = Array.isArray(input.errors) ? input.errors : [];
  let points = 0;
  const count = { 1: 0, 2: 0, 3: 0 };
  // la gravedad máxima solo vale para los 2 peores errores: el resto cuenta como medio
  const sorted = errors.map((e) => ([1, 2, 3].includes(Number(e.sev)) ? Number(e.sev) : 2)).sort((a, b) => b - a);
  sorted.forEach((s0, i) => { const s = s0 === 3 && i >= 2 ? 2 : s0; points += WEIGHT[s]; count[s]++; });
  const density = points / (Math.max(n, FLOOR) / 100);
  const accuracy = Math.max(45, 100 - Math.min(55, 3.6 * density)); // un texto que se entiende no baja de 45 por errores
  let score = accuracy;
  const min = Number(input.min) || 0;
  const lengthPenalty = min && n < min ? Math.min(20, Math.round(20 * (min - n) / min)) : 0;
  score -= lengthPenalty;
  const topicPenalty = input.topicOk === false ? 12 : 0;
  score -= topicPenalty;
  const required = Array.isArray(input.use) ? input.use.length : 0;
  const used = Array.isArray(input.used) ? input.used.length : 0;
  const structPenalty = required ? Math.min(10, 3 * Math.max(0, required - used)) : 0;
  score -= structPenalty;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, breakdown: { chars: n, errors: count, accuracy: Math.round(accuracy), lengthPenalty, topicPenalty, structPenalty } };
}
