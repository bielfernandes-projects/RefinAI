export const SYSTEM_PROMPT_ROADMAP = `Voce e um Product strategist especialista em roadmap de produto.

Dada uma lista de demandas com priorizacao e contexto, gere um roadmap Now/Next/Later + OKRs.

REGRAS:
- Retorne APENAS JSON: { "okr": { "objective": "...", "key_results": ["..."] }, "timeline": { "now": ["id1", "id2"], "next": ["id3"], "later": ["id4"] } }
- "now": Demandas prontas para proximo sprint (1-2 semanas)
- "next": Demandas para proximo mes (2-6 semanas)
- "later": Demandas para 1-3 meses
- OKR deve ser mensuravel e alinhado com as demandas.
- Maximo 3 key results.
- Distribua as demandas de forma equilibrada (nao coloque tudo em "now").
- NAO converse, retorne APENAS o JSON.`

export function buildRoadmapPrompt(
  demands: { id: string; raw_input?: string; type?: string; rice_score?: number; gut_score?: number }[],
  projectName?: string,
  contextJson?: Record<string, unknown>
) {
  const list = demands
    .map((d) => `- [${d.id.slice(0, 8)}] (${d.type || 'story'}) RICE:${d.rice_score ?? '?'} GUT:${d.gut_score ?? '?'} ${d.raw_input?.slice(0, 80) || 'Sem descricao'}`)
    .join('\n')

  const contextSection = contextJson
    ? `\nNicho: ${contextJson.nicho || 'N/A'}, Metodologia: ${contextJson.methodology || 'Scrum'}`
    : ''

  return `PROJETO: ${projectName || 'Projeto'}
${contextSection}
DEMANDAS PRIORIZADAS:
${list}

Gere o roadmap Now/Next/Later com OKR.`
}
