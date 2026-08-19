import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'
import { SYSTEM_PROMPT_GAPS, buildGapsPrompt } from '@/lib/prompts/tradutor'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rawInput, projectId } = await request.json()

  if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length < 10) {
    return NextResponse.json(
      { error: 'Rascunho muito curto. Minimo de 10 caracteres.' },
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

  try {
    const systemPrompt = SYSTEM_PROMPT_GAPS
    const userPrompt = buildGapsPrompt(rawInput, contextJson)
    const response = await callNemotron(systemPrompt, userPrompt, userApiKey)

    // Parse JSON response
    let questions
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch {
      return NextResponse.json(
        { error: 'Resposta da IA em formato invalido. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Nemotron error:', error)
    return NextResponse.json(
      { error: 'Erro ao comunicar com a IA. Tente novamente.' },
      { status: 500 }
    )
  }
}
