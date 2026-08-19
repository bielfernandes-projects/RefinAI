import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, key } = await request.json() as { provider: 'gemini' | 'openai' | 'anthropic'; key: string }

    if (!provider || !key) {
      return NextResponse.json({ error: 'provider e key são obrigatórios' }, { status: 400 })
    }

    let ok = false
    let message = ''

    try {
      if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'OK' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        })
        if (response.ok) {
          ok = true
          message = 'Key válida'
        } else {
          const err = await response.json()
          message = err.error?.message || `HTTP ${response.status}`
        }
      } else if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        })
        if (response.ok) {
          ok = true
          message = 'Key válida'
        } else {
          const err = await response.json()
          message = err.error?.message || `HTTP ${response.status}`
        }
      } else if (provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'OK' }],
          }),
        })
        if (response.ok) {
          ok = true
          message = 'Key válida'
        } else {
          const err = await response.json()
          message = err.error?.message || `HTTP ${response.status}`
        }
      } else {
        return NextResponse.json({ error: 'Provider inválido' }, { status: 400 })
      }
    } catch (err) {
      message = err instanceof Error ? err.message : 'Erro de rede'
    }

    return NextResponse.json({ ok, message }, { status: ok ? 200 : 400 })
  } catch (error) {
    console.error('Test key error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}