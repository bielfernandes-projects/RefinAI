import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'
import { SYSTEM_PROMPT_SPEC } from '@/lib/prompts/tradutor'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rawInput, answers, projectId } = await request.json()

  if (!rawInput || typeof rawInput !== 'string') {
    return NextResponse.json(
      { error: 'Rascunho e obrigatorio.' },
      { status: 400 }
    )
  }

  if (!answers || typeof answers !== 'object') {
    return NextResponse.json(
      { error: 'Respostas do detetive de gaps sao obrigatorias.' },
      { status: 400 }
    )
  }

  // Get project context
  let contextJson = null
  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('context_json')
      .eq('id', projectId)
      .single()

    contextJson = project?.context_json
  }

  // Get BYOK key if exists
  const { data: settings } = await supabase
    .from('user_settings')
    .select('nvidia_api_key')
    .eq('user_id', user.id)
    .single()

  const userApiKey = settings?.nvidia_api_key || undefined

  const contextSection = contextJson
    ? `\n\nCONTEXTO DO PROJETO:
- Nicho: ${contextJson.nicho || 'Nao informado'}
- Stack: ${contextJson.stack || 'Nao informado'}
- Time: ${contextJson.team_size || 'Nao informado'}
- QA: ${contextJson.has_qa ? 'Sim' : 'Nao'}
- Metodologia: ${contextJson.methodology || 'Scrum'}`
    : ''

  const answersSection = `\n\nRESPOSTAS DO DETETIVE DE GAPS:
${Object.entries(answers)
  .map(([id, answer]) => `Pergunta ${id}: ${answer}`)
  .join('\n')}`

  const userPrompt = `RASCUNHO ORIGINAL:
${rawInput}
${contextSection}
${answersSection}

Gere a especificacao tecnica completa em Markdown.`

  try {
    const response = await callNemotron(SYSTEM_PROMPT_SPEC, userPrompt, userApiKey)

    return NextResponse.json({ spec: response })
  } catch (error) {
    console.error('Nemotron error:', error)
    return NextResponse.json(
      { error: 'Erro ao comunicar com a IA. Tente novamente.' },
      { status: 500 }
    )
  }
}
