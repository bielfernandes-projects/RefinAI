export const TONE_STYLES = {
  executivo: {
    label: 'Executivo',
    description: 'Linguagem corporativa, KPIs, impacto no business',
    instruction: `Retorne um paragrafo unico em linguagem executiva corporativa.
Foque: KPIs, ROI, risco, impacto no business.
Maximo 3 frases. Sem jargao tecnico.`,
  },
  stakeholder: {
    label: 'Stakeholder',
    description: 'Beneficios tangiveis, value proposition, timing',
    instruction: `Retorne um paragrafo focado em beneficios para o stakeholder.
Foque: O que ganhamos, por que agora, como afeta o cliente.
Tom amigavel mas profissional. Maximo 4 frases.`,
  },
  tecnico: {
    label: 'Tecnico',
    description: 'Detalhes de implementacao, dependencias, estimativas',
    instruction: `Retorne uma descricao tecnica para o time de desenvolvimento.
Inclua: stack, dependencias, complexidade estimada, riscos tecnicos.
Pode usar bullet points. Maximo 6 items.`,
  },
} as const

export type ToneKey = keyof typeof TONE_STYLES

export const SYSTEM_PROMPT_REVERSE = `Voce e um comunicador especialista em traduzir linguagem tecnica para diferentes audiencias.

Dada uma demanda tecnica, reescreva-a no tom solicitado.

REGRAS:
- NAO adicione informacoes que nao estejam no input.
- Mantenha a essencia da demanda intacta.
- Responda APENAS o texto no tom solicitado.
- NAO inclua titulos, cabecalhos ou formatacao extra.`

export function buildReversePrompt(spec: string, tone: ToneKey, channel?: string) {
  const channelNote = channel ? `\nCanal de comunicacao: ${channel}` : ''
  return `DEMANDA ORIGINAL:
${spec}

Tom solicitado: ${TONE_STYLES[tone].label}
Instrucao: ${TONE_STYLES[tone].instruction}${channelNote}

Reescreva no tom solicitado.`
}
