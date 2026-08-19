export interface NemotronMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface NemotronResponse {
  choices?: {
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }[]
  error?: {
    code: number
    message: string
  }
}

export async function callNemotron(
  systemPrompt: string,
  userPrompt: string,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.NVIDIA_API_KEY
  if (!key) throw new Error('NVIDIA_API_KEY not configured')

  const model = 'nvidia/nemotron-3.5-lightning-30b-a3b'
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions'

  const messages: NemotronMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const body = {
    model,
    messages,
    temperature: 0.3,
    top_p: 0.95,
    max_tokens: 8192,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text()
    let errDetail = errText
    try {
      const errJson = JSON.parse(errText)
      errDetail = JSON.stringify(errJson, null, 2)
    } catch {
    }
    console.error('Nemotron API error:', { 
      status: response.status, 
      body: errDetail, 
      url,
      keyPrefix: key?.substring(0, 10) + '...'
    })
    throw new Error(`Nemotron API error (${response.status}): ${errDetail}`)
  }

  const data: NemotronResponse = await response.json()

  if (data.error) {
    throw new Error(`Nemotron error: ${data.error.message}`)
  }

  const text = data.choices?.[0]?.message?.content
  if (!text) {
    throw new Error('No text in Nemotron response')
  }

  return text
}