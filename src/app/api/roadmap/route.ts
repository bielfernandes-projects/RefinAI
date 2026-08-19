import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { SYSTEM_PROMPT_ROADMAP, buildRoadmapPrompt } from '@/lib/prompts/roadmap'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const { data: project } = await supabase.from('projects').select('name, context_json').eq('id', projectId).single()
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { data: demands } = await supabase
    .from('demands')
    .select('id, raw_input, type, prioritization_scores(rice_score, gut_score)')
    .eq('project_id', projectId)

  const demandsWithScores = (demands || []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    raw_input: d.raw_input as string | undefined,
    type: d.type as string | undefined,
    rice_score: (d.prioritization_scores as Record<string, unknown> | null)?.rice_score as number | undefined,
    gut_score: (d.prioritization_scores as Record<string, unknown> | null)?.gut_score as number | undefined,
  }))

  const { data: settings } = await supabase.from('user_settings').select('gemini_api_key').eq('user_id', user.id).single()

  try {
    const response = await callGemini(SYSTEM_PROMPT_ROADMAP, buildRoadmapPrompt(demandsWithScores, project.name, project.context_json), settings?.gemini_api_key || undefined)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error('Roadmap error:', error)
    return NextResponse.json({ error: 'Erro ao gerar roadmap' }, { status: 500 })
  }
}
