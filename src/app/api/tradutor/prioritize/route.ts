import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'
import { SYSTEM_PROMPT_PRIORITIZE, buildPrioritizePrompt } from '@/lib/prompts/tradutor'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { demands, projectId } = await request.json()

  if (!demands?.length) {
    return NextResponse.json({ error: 'No demands provided' }, { status: 400 })
  }

  let contextJson = null
  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('context_json')
      .eq('id', projectId)
      .single()
    contextJson = project?.context_json
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select('nvidia_api_key')
    .eq('user_id', user.id)
    .single()

  const userApiKey = settings?.nvidia_api_key || undefined

  try {
    const response = await callNemotron(SYSTEM_PROMPT_PRIORITIZE, buildPrioritizePrompt(demands), userApiKey)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0])

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Prioritize error:', error)
    return NextResponse.json({ error: 'Erro ao priorizar' }, { status: 500 })
  }
}