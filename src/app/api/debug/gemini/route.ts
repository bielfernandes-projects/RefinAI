import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's BYOK key if exists
    const { data: settings } = await supabase
      .from('user_settings')
      .select('nvidia_api_key')
      .eq('user_id', user.id)
      .single()

    const userApiKey = settings?.nvidia_api_key || undefined
    const keyToTest = userApiKey || process.env.NVIDIA_API_KEY

    if (!keyToTest) {
      return NextResponse.json(
        { ok: false, error: 'Nenhuma API key configurada (nem BYOK nem env)' },
        { status: 400 }
      )
    }

    // Test with a simple prompt
    const response = await callNemotron(
      'Responda apenas: OK',
      'Teste de conectividade',
      keyToTest
    )

    return NextResponse.json({
      ok: true,
      response: response.slice(0, 100),
      usingByok: !!userApiKey,
    })
  } catch (error) {
    console.error('Nemotron debug error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}