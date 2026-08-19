export const SYSTEM_PROMPT_PRIORITIZE = `Voce e um Product Owner especialista em priorizacao de backlog.

Dada uma lista de demandas com contextos, sugira scores RICE e GUT para cada uma.

REGRAS:
- Retorne APENAS JSON: { "scores": [{ "demand_id": "...", "rice": { "reach": 1-5, "impact": 1-5, "confidence": 25|50|80|100, "effort": 1-5 }, "gut": { "gravity": 1-5, "urgency": 1-5, "tendency": 1-5 }, "justification": "..." }] }
- NAO converse, NAO explique. Apenas JSON.
- Cada score deve ter uma justificativa curta (1 frase).
- Seja conservador: confidence so deve ser 100 se houver dados historicos.`

export function buildPrioritizePrompt(demands: { id: string; raw_input?: string; final_spec_markdown?: string }[]) {
  const list = demands
    .map((d, i) => `${i + 1}. [${d.id.slice(0, 8)}] ${d.raw_input || d.final_spec_markdown || 'Sem descricao'}`)
    .join('\n')

  return `DEMANDAS PARA PRIORIZAR:
${list}

Sugira scores RICE e GUT para cada demanda.`
}
