'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ArrowLeftRight, Copy, Check } from 'lucide-react'

const tones = [
  { key: 'executivo', label: 'Executivo', desc: 'Corporativo, KPIs, ROI' },
  { key: 'stakeholder', label: 'Stakeholder', desc: 'Beneficios, value prop' },
  { key: 'tecnico', label: 'Tecnico', desc: 'Detalhes, dependencias' },
] as const

export default function TradutorReversoPage() {
  const [spec, setSpec] = useState('')
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const supabase = createClient()

  async function handleTranslate(tone: string) {
    if (!spec.trim()) return
    setLoading(tone)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/tradutor-reverso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ spec, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults({ ...results, [tone]: data.result })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(null)
    }
  }

  function handleCopy(text: string, tone: string) {
    navigator.clipboard.writeText(text)
    setCopied(tone)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Tradutor Reverso</h1>
        <p className="text-zinc-400">Nivele sua demanda para qualquer audiencia</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Texto Tecnico</CardTitle>
          <CardDescription className="text-zinc-400">Cole a especificacao ou demanda tecnica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Cole aqui uma especificacao tecnica, user story ou descricao de demanda..."
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            className="min-h-[150px] bg-zinc-800 border-zinc-700 text-zinc-100"
          />
          <div className="flex flex-wrap gap-3">
            {tones.map((t) => (
              <Button
                key={t.key}
                onClick={() => handleTranslate(t.key)}
                disabled={loading !== null || !spec.trim()}
                variant="outline"
                className="border-zinc-700 text-zinc-300"
              >
                {loading === t.key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />}
                {t.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Resultados</h3>
          <Tabs defaultValue={Object.keys(results)[0]} className="w-full">
            <TabsList className="bg-zinc-800">
              {tones.filter((t) => results[t.key]).map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="data-[state=active]:bg-zinc-700">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tones.filter((t) => results[t.key]).map((t) => (
              <TabsContent key={t.key} value={t.key} className="mt-4">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-indigo-500/10 text-indigo-400">{t.desc}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(results[t.key], t.key)}
                        className="text-zinc-400 hover:text-zinc-100"
                      >
                        {copied === t.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{results[t.key]}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}