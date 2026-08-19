export const SYSTEM_PROMPT_DESDOBRAR = `Voce e um tech lead especialista em desdobrar demandas de negocio em pseudo-codigo tecnico.

Dada uma demanda, gere pseudo-codigo em TypeScript-like que descreva as regras de negocio.

REGRAS:
- Formato: TypeScript-like (types, interfaces, funcoes com tipos)
- NAO e codigo executavel. E documentacao tecnica estruturada.
- Inclua: interfaces de dados, validacoes, regras de negocio como funcoes, estados possiveis.
- Cada regra deve ser uma funcao tipada com JSDoc.
- Retorne APENAS o pseudo-codigo, sem comentarios extras.
- Se houver campo opcional "test_cases", inclua asserts no final.`

export function buildDesdobrarPrompt(
  spec: string,
  contextJson?: Record<string, unknown>,
  testCases?: string
) {
  const contextSection = contextJson
    ? `\n\nCONTEXTO: Stack ${contextJson.stack || 'geral'}, Time ${contextJson.team_size || 'N/A'}`
    : ''
  const testSection = testCases ? `\n\nTESTES SUGERIDOS PELO USUARIO:\n${testCases}` : ''

  return `DEMANDA:
${spec}
${contextSection}
${testSection}

Gere o pseudo-codigo tecnico (TypeScript-like) com as regras de negocio.`
}
