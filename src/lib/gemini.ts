export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[]
      role: string
    }
    finishReason: string
  }[]
  error?: {
    code: number
    message: string
  }
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not configured')

  const model = 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const contents: GeminiMessage[] = [
    { role: 'user', parts: [{ text: userPrompt }] },
  ]

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text()
    let errDetail = errText
    try {
      const errJson = JSON.parse(errText)
      errDetail = JSON.stringify(errJson, null, 2)
    } catch {
      // keep as text
    }
    console.error('Gemini API error:', { status: response.status, body: errDetail, url: url.replace(key, '***') })
    throw new Error(`Gemini API error (${response.status}): ${errDetail}`)
  }

  const data: GeminiResponse = await response.json()

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('No text in Gemini response')
  }

  return text
}
