export const SYSTEM_PROMPT_RELEASE_NOTES = `Voce e um comunicador de produto especialista em release notes.

Dada uma lista de demandas finalizadas, gere 2 artefatos de comunicacao.

REGRAS:
- Retorne APENAS JSON: { "internal": "...", "external": "...", "changelog": "..." }
- "internal": Release notes para o time (detalhado, tecnico, inclui PRs/issues se disponivel)
- "external": Release notes para stakeholders/clientes (foco em beneficios, sem jargao)
- "changelog": Changelog formatado em Markdown (## Versao X.Y.Z - Data, ### Added, ### Changed, ### Fixed, ### Removed) pronto para GitHub/Linear/Jira
- NAO invente features que nao estejam na lista.
- Tom profissional mas acessivel.
- NAO converse, retorne APENAS o JSON.
- IMPORTANTE: TODO conteudo em PORTUGUES (PT-BR). NUNCA retorne em ingles.`

export function buildReleaseNotesPrompt(
  finishedDemands: { title?: string; final_spec_markdown?: string; type?: string }[],
  projectName?: string,
  template?: 'b2b' | 'b2c',
  version?: string
) {
  const list = finishedDemands
    .map((d, i) => `${i + 1}. [${d.type || 'story'}] ${d.title || d.final_spec_markdown?.split('\n')[0] || 'Sem titulo'}`)
    .join('\n')

  const templateNote = template === 'b2b'
    ? '\nTom: B2B, focado em produtividade, ROI e conformidade.'
    : template === 'b2c'
    ? '\nTom: B2C, focado em experiencia do usuario, facilidade e novidades.'
    : ''

  const versionNote = version ? `\nVersao: ${version}` : ''

  return `PROJETO: ${projectName || 'Projeto'}${versionNote}
DEMANDAS FINALIZADAS:
${list}
${templateNote}

Gere os 3 artefatos de release notes: internal (para o time), external (para stakeholders) e changelog (Markdown pronto para GitHub/Linear).`
}