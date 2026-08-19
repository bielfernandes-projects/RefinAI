import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callNemotron } from '@/lib/gemini'
import { SYSTEM_PROMPT_GAPS, buildGapsPrompt } from '@/lib/prompts/tradutor'

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

    // Test with EXACT same call as tradutor/gaps
    const testInput = "Preciso de uma tela de login com email e senha"
    const systemPrompt = SYSTEM_PROMPT_GAPS
    const userPrompt = buildGapsPrompt(testInput, undefined)

    console.log('Debug Nvidia: Testing with key prefix:', keyToTest.substring(0, 10) + '...')
    console.log('Debug Nvidia: System prompt length:', systemPrompt.length)
    console.log('Debug Nvidia: User prompt length:', userPrompt.length)

    const response = await callNemotron(systemPrompt, userPrompt, keyToTest)

    // Try to parse JSON like tradutor/gaps does
    let questions
    let parseError = null
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (e) {
      parseError = e instanceof Error ? e.message : 'Parse error'
    }

    return NextResponse.json({
      ok: true,
      responsePreview: response.slice(0, 500),
      responseLength: response.length,
      parsedQuestions: questions?.questions?.length || 0,
      parseError,
      usingByok: !!userApiKey,
      model: 'nvidia/nemotron-3.5-lightning-30b-a3b'
    })
  } catch (error) {
    console.error('Debug Nvidia error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}