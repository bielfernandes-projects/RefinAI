'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, FileText, Copy, Check } from 'lucide-react'

export default function ReleaseNotesPage() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<{ internal?: string; external?: string; changelog?: string }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const supabase = createClient()

  async function handleGenerate() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)

    const demands = input.split('\n').filter(Boolean).map((line, i) => ({
      id: `demand-${i}`,
      raw_input: line.trim(),
      type: 'story',
    }))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/release-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ demandIds: demands.map((d) => d.id) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Release Notes</h1>
        <p className="text-zinc-400">3 artefatos prontos: para time, para stakeholders, changelog Markdown</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!results.internal ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Demandas Finalizadas</CardTitle>
            <CardDescription className="text-zinc-400">Liste as demandas prontas (uma por linha)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={"Login com Google\nRelatorio de vendas\nCorrecao do checkout\nAPI de integracao"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <Button onClick={handleGenerate} disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Gerar Release Notes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="external" className="w-full">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="external" className="data-[state=active]:bg-zinc-700">Para Clientes</TabsTrigger>
            <TabsTrigger value="internal" className="data-[state=active]:bg-zinc-700">Para o Time</TabsTrigger>
            <TabsTrigger value="changelog" className="data-[state=active]:bg-zinc-700">Changelog</TabsTrigger>
          </TabsList>

          <TabsContent value="external" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-emerald-500/10 text-emerald-400">Para Clientes/Stakeholders</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(results.external || '', 'ext')} className="text-zinc-400">
                    {copied === 'ext' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap">{results.external}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internal" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-500/10 text-blue-400">Para o Time</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(results.internal || '', 'int')} className="text-zinc-400">
                    {copied === 'int' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap">{results.internal}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changelog" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-cyan-500/10 text-cyan-400">Changelog Markdown</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(results.changelog || '', 'changelog')} className="text-zinc-400">
                    {copied === 'changelog' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">{results.changelog}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-4">
            <Button variant="outline" onClick={() => { setResults({}); setInput('') }} className="border-zinc-700 text-zinc-300">
              Nova Geracao
            </Button>
          </div>
        </Tabs>
      )}
    </div>
  )
}