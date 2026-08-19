'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Scissors } from 'lucide-react'

interface Story {
  title: string
  description: string
  acceptance_criteria: string[]
  estimated_effort: string
}

export default function FatiadorPage() {
  const [spec, setSpec] = useState('')
  const [phases, setPhases] = useState('')
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleFatia() {
    if (!spec.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/fatiador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ spec, phases: phases ? parseInt(phases) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStories(data.stories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const effortColors: Record<string, string> = {
    P: 'bg-emerald-500/10 text-emerald-400',
    M: 'bg-amber-500/10 text-amber-400',
    G: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Fatiador de Epicos</h1>
        <p className="text-zinc-400">Vertical slicing com historias de usuario</p>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!stories.length ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Epico / Demanda Complexa</CardTitle>
            <CardDescription className="text-zinc-400">Cole o epico para fatiar em stories verticais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cole aqui a descricao do epico ou demanda complexa..."
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              className="min-h-[150px] bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <div className="space-y-2">
              <Label className="text-zinc-300">Qtd de Fases (opcional)</Label>
              <Input
                type="number"
                min={2}
                max={8}
                placeholder="Auto (2-8)"
                value={phases}
                onChange={(e) => setPhases(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 w-32"
              />
            </div>
            <Button onClick={handleFatia} disabled={loading || !spec.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2 h-4 w-4" />}
              Fatiar com IA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge className="bg-indigo-500/10 text-indigo-400">{stories.length} stories</Badge>
            <Button variant="outline" onClick={() => { setStories([]); setSpec('') }} className="border-zinc-700 text-zinc-300">Nova Fatiada</Button>
          </div>
          <div className="space-y-3">
            {stories.map((s, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-500">#{i + 1}</span>
                      <h4 className="text-sm font-medium text-zinc-100">{s.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-400">{s.description}</p>
                    {s.acceptance_criteria?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Criterios de Aceite:</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          {s.acceptance_criteria.map((c, j) => (
                            <li key={j}>- {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Badge className={effortColors[s.estimated_effort] || 'bg-zinc-500/10 text-zinc-400'}>
                    {s.estimated_effort}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
