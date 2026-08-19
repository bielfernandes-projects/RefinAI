import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'

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
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single()

    const userApiKey = settings?.gemini_api_key || undefined
    const keyToTest = userApiKey || process.env.GEMINI_API_KEY

    if (!keyToTest) {
      return NextResponse.json(
        { ok: false, error: 'Nenhuma API key configurada (nem BYOK nem env)' },
        { status: 400 }
      )
    }

    // Test with a simple prompt
    const response = await callGemini(
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
    console.error('Gemini debug error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}