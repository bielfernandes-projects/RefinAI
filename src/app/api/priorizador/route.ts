import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { SYSTEM_PROMPT_PRIORITIZE, buildPrioritizePrompt } from '@/lib/prompts/priorizador'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { demands } = await request.json()
  if (!demands?.length) return NextResponse.json({ error: 'No demands' }, { status: 400 })

  const { data: settings } = await supabase.from('user_settings').select('gemini_api_key').eq('user_id', user.id).single()

  try {
    const response = await callGemini(SYSTEM_PROMPT_PRIORITIZE, buildPrioritizePrompt(demands), settings?.gemini_api_key || undefined)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error('Prioritize error:', error)
    return NextResponse.json({ error: 'Erro ao priorizar' }, { status: 500 })
  }
}
