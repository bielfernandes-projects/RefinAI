'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, FileCode, Copy, Check } from 'lucide-react'

export default function DesdobradorPage() {
  const [spec, setSpec] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  async function handleDesdobrar() {
    if (!spec.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/desdobrador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ spec }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Desdobrador</h1>
        <p className="text-zinc-400">Quebre complexidade em pseudo-codigo tecnico</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Demanda</CardTitle>
          <CardDescription className="text-zinc-400">Cole a especificacao para gerar pseudo-codigo TypeScript-like</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Cole aqui a especificacao da demanda..."
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            className="min-h-[150px] bg-zinc-800 border-zinc-700 text-zinc-100"
          />
          <Button onClick={handleDesdobrar} disabled={loading || !spec.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCode className="mr-2 h-4 w-4" />}
            Desdobrar em Pseudo-Codigo
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-100">Pseudo-Codigo Gerado</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="text-zinc-400 hover:text-zinc-100">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
