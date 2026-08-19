'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Map, Copy, Check } from 'lucide-react'

interface RoadmapData {
  okr: { objective: string; key_results: string[] }
  timeline: { now: string[]; next: string[]; later: string[] }
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ projectId: 'current' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRoadmap(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar roadmap')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!roadmap) return
    const md = `# Roadmap\n\n## OKR\n**Objetivo:** ${roadmap.okr.objective}\n\n${roadmap.okr.key_results.map((kr) => `- KR: ${kr}`).join('\n')}\n\n## Now\n${roadmap.timeline.now.map((d) => `- ${d}`).join('\n')}\n\n## Next\n${roadmap.timeline.next.map((d) => `- ${d}`).join('\n')}\n\n## Later\n${roadmap.timeline.later.map((d) => `- ${d}`).join('\n')}`
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Roadmap</h1>
        <p className="text-zinc-400">Now / Next / Later com OKRs</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!roadmap ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Gerar Roadmap</CardTitle>
            <CardDescription className="text-zinc-400">A IA vai analisar suas demandas e gerar um roadmap com OKR</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Map className="mr-2 h-4 w-4" />}
              Gerar Roadmap com IA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleCopy} className="border-zinc-700 text-zinc-300">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copiar Markdown
            </Button>
          </div>

          {/* OKR */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">Objetivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg text-zinc-200 font-medium">{roadmap.okr.objective}</p>
              <div className="space-y-2">
                {roadmap.okr.key_results.map((kr, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge className="mt-0.5 bg-indigo-500/10 text-indigo-400 flex-shrink-0">KR{i + 1}</Badge>
                    <p className="text-sm text-zinc-400">{kr}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="grid grid-cols-3 gap-4">
            {(['now', 'next', 'later'] as const).map((phase) => (
              <Card key={phase} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-100 capitalize">{phase}</CardTitle>
                  <CardDescription className="text-zinc-500">
                    {phase === 'now' ? '1-2 semanas' : phase === 'next' ? '1 mes' : '1-3 meses'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {roadmap.timeline[phase]?.length > 0 ? (
                      roadmap.timeline[phase].map((item, i) => (
                        <div key={i} className="p-2 rounded bg-zinc-800/50 text-sm text-zinc-300">
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-600">Vazio</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" onClick={() => setRoadmap(null)} className="border-zinc-700 text-zinc-300">
            Novo Roadmap
          </Button>
        </div>
      )}
    </div>
  )
}
