'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Sparkles, BarChart3, ArrowUpDown } from 'lucide-react'

interface Score {
  demand_id: string
  title: string
  rice: { reach: number; impact: number; confidence: number; effort: number }
  gut: { gravity: number; urgency: number; tendency: number }
  justification: string
}

export default function PriorizadorPage() {
  const [input, setInput] = useState('')
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handlePrioritize() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)

    const demands = input.split('\n').filter(Boolean).map((line, i) => ({
      id: `demand-${i}`,
      raw_input: line.trim(),
    }))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/priorizador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ demands }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const enriched = (data.scores || []).map((s: Score, i: number) => ({
        ...s,
        title: demands[i]?.raw_input || s.demand_id,
      }))
      setScores(enriched.sort((a: Score, b: Score) => {
        const riceA = (a.rice.reach * a.rice.impact * a.rice.confidence) / a.rice.effort
        const riceB = (b.rice.reach * b.rice.impact * b.rice.confidence) / b.rice.effort
        return riceB - riceA
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  function calcRice(r: Score['rice']) {
    return ((r.reach * r.impact * r.confidence) / r.effort).toFixed(1)
  }
  function calcGut(g: Score['gut']) {
    return g.gravity * g.urgency * g.tendency
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Priorizador</h1>
        <p className="text-zinc-400">RICE e GUT lado a lado com ranking paralelo</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!scores.length ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Demandas para Priorizar</CardTitle>
            <CardDescription className="text-zinc-400">Coloque uma demanda por linha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={"Tela de login com Google\nRelatorio de vendas mensal\nBug no checkout\nAPI de integracao com ERB"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[180px] bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <Button onClick={handlePrioritize} disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Priorizar com IA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge className="bg-indigo-500/10 text-indigo-400">{scores.length} demandas</Badge>
            <Button variant="outline" onClick={() => { setScores([]); setInput('') }} className="border-zinc-700 text-zinc-300">Nova Priorizacao</Button>
          </div>

          <Tabs defaultValue="parallel" className="w-full">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="parallel" className="data-[state=active]:bg-zinc-700">Paralelo</TabsTrigger>
              <TabsTrigger value="rice" className="data-[state=active]:bg-zinc-700">RICE</TabsTrigger>
              <TabsTrigger value="gut" className="data-[state=active]:bg-zinc-700">GUT</TabsTrigger>
            </TabsList>

            <TabsContent value="parallel" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> RICE (maior = melhor)</h3>
                  {[...scores].sort((a, b) => parseFloat(calcRice(b.rice)) - parseFloat(calcRice(a.rice))).map((s, i) => (
                    <Card key={s.demand_id} className="bg-zinc-900 border-zinc-800 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-zinc-500">{i + 1}</span>
                          <div>
                            <p className="text-sm text-zinc-100 font-medium">{s.title.slice(0, 60)}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">R:{s.rice.reach} I:{s.rice.impact} C:{s.rice.confidence} E:{s.rice.effort}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-400">{calcRice(s.rice)}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2"><ArrowUpDown className="h-4 w-4" /> GUT (maior = mais urgente)</h3>
                  {[...scores].sort((a, b) => calcGut(b.gut) - calcGut(a.gut)).map((s, i) => (
                    <Card key={s.demand_id} className="bg-zinc-900 border-zinc-800 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-zinc-500">{i + 1}</span>
                          <div>
                            <p className="text-sm text-zinc-100 font-medium">{s.title.slice(0, 60)}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">G:{s.gut.gravity} U:{s.gut.urgency} T:{s.gut.tendency}</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-400">{calcGut(s.gut)}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rice" className="mt-4">
              <div className="space-y-3">
                {[...scores].sort((a, b) => parseFloat(calcRice(b.rice)) - parseFloat(calcRice(a.rice))).map((s, i) => (
                  <Card key={s.demand_id} className="bg-zinc-900 border-zinc-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-zinc-500">{i + 1}</span>
                        <div>
                          <p className="text-sm text-zinc-100 font-medium">{s.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">R:{s.rice.reach} I:{s.rice.impact} C:{s.rice.confidence} E:{s.rice.effort} = {calcRice(s.rice)}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400">{calcRice(s.rice)}</Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 ml-9">{s.justification}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gut" className="mt-4">
              <div className="space-y-3">
                {[...scores].sort((a, b) => calcGut(b.gut) - calcGut(a.gut)).map((s, i) => (
                  <Card key={s.demand_id} className="bg-zinc-900 border-zinc-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-zinc-500">{i + 1}</span>
                        <div>
                          <p className="text-sm text-zinc-100 font-medium">{s.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">G:{s.gut.gravity} U:{s.gut.urgency} T:{s.gut.tendency} = {calcGut(s.gut)}</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-400">{calcGut(s.gut)}</Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 ml-9">{s.justification}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
