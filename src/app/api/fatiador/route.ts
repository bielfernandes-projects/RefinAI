import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { SYSTEM_PROMPT_FATIAR, buildFatiarPrompt } from '@/lib/prompts/fatiador'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { spec, phases, projectId } = await request.json()
  if (!spec) return NextResponse.json({ error: 'spec required' }, { status: 400 })

  let contextJson = null
  if (projectId) {
    const { data: project } = await supabase.from('projects').select('context_json').eq('id', projectId).single()
    contextJson = project?.context_json
  }

  const { data: settings } = await supabase.from('user_settings').select('gemini_api_key').eq('user_id', user.id).single()

  try {
    const response = await callGemini(SYSTEM_PROMPT_FATIAR, buildFatiarPrompt(spec, phases, contextJson), settings?.gemini_api_key || undefined)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error('Fatiar error:', error)
    return NextResponse.json({ error: 'Erro ao fatiar' }, { status: 500 })
  }
}
