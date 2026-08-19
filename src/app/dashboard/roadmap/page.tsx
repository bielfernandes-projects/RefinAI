'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Map, Copy, Check, Filter } from 'lucide-react'

interface Demand {
  id: string
  raw_input: string
  type: string | null
  rice_score: number | null
  gut_score: number | null
}

interface RoadmapData {
  okr: { objective: string; key_results: string[] }
  timeline: { now: string[]; next: string[]; later: string[] }
}

export default function RoadmapPage() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadDemands()
  }, [])

  async function loadDemands() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!project) return

      const { data: demandsData } = await supabase
        .from('demands')
        .select('id, raw_input, type, prioritization_scores(rice_score, gut_score)')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })

      if (demandsData) {
        const mappedDemands: Demand[] = demandsData.map((d) => ({
          id: d.id,
          raw_input: d.raw_input || '',
          type: d.type,
          rice_score: (d.prioritization_scores as any)?.rice_score ?? null,
          gut_score: (d.prioritization_scores as any)?.gut_score ?? null,
        }))
        setDemands(mappedDemands)
        setSelectedIds(mappedDemands.map((d) => d.id))
      }
    } catch (err) {
      console.error('Error loading demands:', err)
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    if (selectedIds.length === demands.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(demands.map((d) => d.id))
    }
  }

  async function handleGenerate() {
    if (selectedIds.length === 0) {
      setError('Selecione pelo menos uma demanda')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ demandIds: selectedIds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRoadmap(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar roadmap')
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy() {
    if (!roadmap) return
    const md = `# Roadmap\n\n## OKR\n**Objetivo:** ${roadmap.okr.objective}\n\n${roadmap.okr.key_results.map((kr) => `- KR: ${kr}`).join('\n')}\n\n## Now\n${roadmap.timeline.now.map((d) => `- ${d}`).join('\n')}\n\n## Next\n${roadmap.timeline.next.map((d) => `- ${d}`).join('\n')}\n\n## Later\n${roadmap.timeline.later.map((d) => `- ${d}`).join('\n')}`
    navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getScoreBadge(rice: number | null, gut: number | null) {
    if (rice === null && gut === null) return null
    const parts = []
    if (rice !== null) parts.push(`RICE: ${rice.toFixed(1)}`)
    if (gut !== null) parts.push(`GUT: ${gut}`)
    return parts.join(' | ')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Roadmap</h1>
          <p className="text-zinc-400">Now / Next / Later com OKRs - selecione as demandas</p>
        </div>
        <Button variant="outline" onClick={loadDemands} disabled={loading} className="gap-2">
          <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!roadmap ? (
        <>
          {loading ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-indigo-500 mb-2" />
                <p className="text-zinc-400">Carregando demandas...</p>
              </CardContent>
            </Card>
          ) : demands.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center">
                <Filter className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400 mb-2">Nenhuma demanda encontrada</p>
                <p className="text-sm text-zinc-500">Crie demandas no Tradutor ou Priorizador primeiro</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-zinc-100">Selecionar Demandas para o Roadmap</CardTitle>
                    <CardDescription className="text-zinc-400">
                      {selectedIds.length} de {demands.length} selecionadas
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAll}
                    className="text-zinc-400 hover:text-zinc-100"
                  >
                    {selectedIds.length === demands.length ? 'Desmarcar todos' : 'Marcar todos'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {demands.map((demand) => {
                    const isSelected = selectedIds.includes(demand.id)
                    const scoreBadge = getScoreBadge(demand.rice_score, demand.gut_score)
                    return (
                      <label
                        key={demand.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(demand.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-100 truncate">{demand.raw_input}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                              {demand.type || 'story'}
                            </Badge>
                            {scoreBadge && (
                              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                                {scoreBadge}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t border-zinc-800">
                <Button
                  onClick={handleGenerate}
                  disabled={generating || selectedIds.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Map className="h-4 w-4" />
                      Gerar Roadmap com IA
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-zinc-700 text-zinc-300 gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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