import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'
import { SYSTEM_PROMPT_DESDOBRAR, buildDesdobrarPrompt } from '@/lib/prompts/tradutor'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { spec, projectId, testCases } = await request.json()

  if (!spec) {
    return NextResponse.json({ error: 'spec required' }, { status: 400 })
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
    const response = await callNemotron(SYSTEM_PROMPT_DESDOBRAR, buildDesdobrarPrompt(spec, contextJson, testCases), userApiKey)
    return NextResponse.json({ result: response })
  } catch (error) {
    console.error('Desdobrar error:', error)
    return NextResponse.json({ error: 'Erro ao desdobrar' }, { status: 500 })
  }
}