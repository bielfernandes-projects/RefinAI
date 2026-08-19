import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'
import { SYSTEM_PROMPT_RELEASE_NOTES, buildReleaseNotesPrompt } from '@/lib/prompts/release-notes'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { demandIds, projectId, template } = await request.json() as { demandIds: string[]; projectId?: string; template?: 'b2b' | 'b2c' }
  if (!demandIds?.length) return NextResponse.json({ error: 'demandIds required' }, { status: 400 })

  const { data: demands } = await supabase.from('demands').select('title:raw_input, final_spec_markdown, type').in('id', demandIds)

  let projectName = 'Projeto'
  if (projectId) {
    const { data: project } = await supabase.from('projects').select('name').eq('id', projectId).single()
    projectName = project?.name || projectName
  }

  const { data: settings } = await supabase.from('user_settings').select('nvidia_api_key').eq('user_id', user.id).single()

  try {
    const response = await callNemotron(SYSTEM_PROMPT_RELEASE_NOTES, buildReleaseNotesPrompt(demands || [], projectName, template), settings?.nvidia_api_key || undefined)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error('Nemotron error:', error)
    return NextResponse.json({ error: 'Erro ao gerar release notes' }, { status: 500 })
  }
}
