import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'
import { SYSTEM_PROMPT_REVERSE, buildReversePrompt, type ToneKey } from '@/lib/prompts/tradutor-reverso'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { spec, tone, channel } = await request.json() as { spec: string; tone: ToneKey; channel?: string }
  if (!spec || !tone) return NextResponse.json({ error: 'spec and tone required' }, { status: 400 })

  const { data: settings } = await supabase.from('user_settings').select('nvidia_api_key').eq('user_id', user.id).single()

  try {
    const response = await callNemotron(SYSTEM_PROMPT_REVERSE, buildReversePrompt(spec, tone, channel), settings?.nvidia_api_key || undefined)
    return NextResponse.json({ result: response })
  } catch (error) {
    console.error('Nemotron error:', error)
    return NextResponse.json({ error: 'Erro ao traduzir' }, { status: 500 })
  }
}
