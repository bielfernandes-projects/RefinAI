'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  FileText,
  AlertCircle,
  BarChart3,
  FileCode,
  Zap,
} from 'lucide-react'

interface Question {
  id: number
  text: string
  category: string
}

interface PrioritizationResult {
  demand_id: string
  rice: { reach: number; impact: number; confidence: number; effort: number }
  gut: { gravity: number; urgency: number; tendency: number }
  justification: string
}

export default function TradutorPage() {
  const [rawInput, setRawInput] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [spec, setSpec] = useState('')
  const [phase, setPhase] = useState<'input' | 'gaps' | 'spec'>('input')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [specTabs, setSpecTabs] = useState<'preview' | 'markdown' | 'prioritizacao' | 'desdobramento'>('preview')
  
  // Prioritization state
  const [prioritization, setPrioritization] = useState<PrioritizationResult[]>([])
  const [prioritizationLoading, setPrioritizationLoading] = useState(false)
  
  // Desdobramento state
  const [desdobramento, setDesdobramento] = useState('')
  const [desdobramentoLoading, setDesdobramentoLoading] = useState(false)

  const supabase = createClient()

  async function handleDetectGaps() {
    if (rawInput.trim().length < 10) {
      setError('Rascunho muito curto. Minimo de 10 caracteres.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/tradutor/gaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ rawInput }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao detectar gaps')
      }

      setQuestions(data.questions || [])
      setPhase('gaps')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateSpec() {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/tradutor/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ rawInput, answers }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar spec')
      }

      setSpec(data.spec)
      setPhase('spec')
      setSpecTabs('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function handlePrioritize() {
    if (!spec) return

    setPrioritizationLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuario nao autenticado')

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const res = await fetch('/api/tradutor/prioritize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ 
          demands: [{ id: 'current-spec', raw_input: spec }],
          projectId: project?.id 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao priorizar')
      }

      setPrioritization(data.scores || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao priorizar')
    } finally {
      setPrioritizationLoading(false)
    }
  }

  async function handleDesdobrar() {
    if (!spec) return

    setDesdobramentoLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuario nao autenticado')

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const res = await fetch('/api/tradutor/desdobrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ 
          spec, 
          projectId: project?.id,
          testCases: true 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao desdobrar')
      }

      setDesdobramento(data.result || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desdobrar')
    } finally {
      setDesdobramentoLoading(false)
    }
  }

  function handleCopySpec() {
    navigator.clipboard.writeText(spec)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyJira() {
    const jira = spec
      .replace(/^### (.+)$/gm, 'h3. $1')
      .replace(/^## (.+)$/gm, 'h2. $1')
      .replace(/^# (.+)$/gm, 'h1. $1')
      .replace(/\*\*(.+?)\*\*/g, '*$1*')
      .replace(/\n- /g, '\n* ')
      .replace(/\n\d+\. /g, '\n# ')

    navigator.clipboard.writeText(jira)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyBitrix() {
    const bitrix = spec
      .replace(/^### (.+)$/gm, '[$1]')
      .replace(/^## (.+)$/gm, '[=$1=]')
      .replace(/^# (.+)$/gm, '[==$1==]')
      .replace(/\*\*(.+?)\*\*/g, '[$1]')

    navigator.clipboard.writeText(bitrix)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyDesdobramento() {
    navigator.clipboard.writeText(desdobramento)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setRawInput('')
    setQuestions([])
    setAnswers({})
    setSpec('')
    setPrioritization([])
    setDesdobramento('')
    setPhase('input')
    setError(null)
  }

  function calcRice(r: PrioritizationResult['rice']) {
    return ((r.reach * r.impact * r.confidence) / r.effort).toFixed(1)
  }

  function calcGut(g: PrioritizationResult['gut']) {
    return g.gravity * g.urgency * g.tendency
  }

  const categoryColors: Record<string, string> = {
    data_origin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    edge_case: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    business_rule: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    acceptance_criteria: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }

  const categoryLabels: Record<string, string> = {
    data_origin: 'Dados',
    edge_case: 'Edge Case',
    business_rule: 'Regra',
    acceptance_criteria: 'Aceite',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Tradutor de Demanda</h1>
        <p className="text-zinc-400">
          Transforme rascunhos em especificacoes tecnicas estruturadas
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Phase 1: Input */}
      {phase === 'input' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Rascunho da Demanda</CardTitle>
            <CardDescription className="text-zinc-400">
              Descreva sua demanda em texto livre. Quanto mais detalhes, melhor o resultado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ex: Precisamos criar uma tela de login com email e senha. O usuario deve conseguir logar com Google tambem. A tela deve ser responsiva..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="min-h-[200px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">
                {rawInput.length} caracteres
              </span>
              <Button
                onClick={handleDetectGaps}
                disabled={loading || rawInput.trim().length < 10}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Detectar Gaps
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 2: Gaps */}
      {phase === 'gaps' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Detetive de Gaps</CardTitle>
                <CardDescription className="text-zinc-400">
                  Responda as perguntas para preencher as lacunas do rascunho
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {questions.length} perguntas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={`mt-0.5 flex-shrink-0 ${categoryColors[q.category] || ''}`}
                  >
                    {categoryLabels[q.category] || q.category}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <Label className="text-zinc-300">{q.text}</Label>
                    <Input
                      placeholder="Sua resposta..."
                      value={answers[q.id] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Separator className="bg-zinc-800 my-4" />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-zinc-700 text-zinc-300"
              >
                Recomecar
              </Button>
              <Button
                onClick={handleGenerateSpec}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Gerar Especificacao
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 3: Spec Output */}
      {phase === 'spec' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Especificacao Tecnica</CardTitle>
                <CardDescription className="text-zinc-400">
                  Pronta para copiar, priorizar, desdobrar ou exportar
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Check className="mr-1 h-3 w-3" />
                Gerada
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue={specTabs} onValueChange={setSpecTabs} className="w-full">
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-700">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="markdown" className="data-[state=active]:bg-zinc-700">
                  Markdown
                </TabsTrigger>
                <TabsTrigger value="prioritizacao" className="data-[state=active]:bg-zinc-700">
                  <BarChart3 className="mr-1 h-3 w-3" /> Priorizacao
                </TabsTrigger>
                <TabsTrigger value="desdobramento" className="data-[state=active]:bg-zinc-700">
                  <FileCode className="mr-1 h-3 w-3" /> Desdobramento
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <div className="prose prose-invert prose-zinc max-w-none">
                  <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 whitespace-pre-wrap text-sm text-zinc-300">
                    {spec}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="markdown" className="mt-4">
                <Textarea
                  readOnly
                  value={spec}
                  className="min-h-[400px] bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="prioritizacao" className="mt-4">
                <div className="space-y-4">
                  {prioritization.length === 0 ? (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400 mb-4">Nenhuma priorizacao gerada ainda</p>
                      <Button
                        onClick={handlePrioritize}
                        disabled={prioritizationLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {prioritizationLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Gerar RICE + GUT
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-zinc-400">RICE + GUT</h4>
                        <Badge className="bg-emerald-500/10 text-emerald-400">
                          {prioritization.length} demandas
                        </Badge>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {prioritization.map((p, i) => (
                          <Card key={p.demand_id} className="bg-zinc-900 border-zinc-800 p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-zinc-500">{i + 1}</span>
                                <div>
                                  <p className="text-sm text-zinc-100 font-medium">{spec.slice(0, 50)}...</p>
                                  <p className="text-xs text-zinc-500 mt-0.5">{p.justification}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-500/10 text-emerald-400">
                                  RICE: {calcRice(p.rice)}
                                </Badge>
                                <Badge className="bg-amber-500/10 text-amber-400">
                                  GUT: {calcGut(p.gut)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                              <span>R:{p.rice.reach} I:{p.rice.impact} C:{p.rice.confidence} E:{p.rice.effort}</span>
                              <span className="text-zinc-700">|</span>
                              <span>G:{p.gut.gravity} U:{p.gut.urgency} T:{p.gut.tendency}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="desdobramento" className="mt-4">
                <div className="space-y-4">
                  {desdobramento === '' ? (
                    <div className="text-center py-8">
                      <FileCode className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400 mb-4">Nenhum desdobramento gerado ainda</p>
                      <Button
                        onClick={handleDesdobrar}
                        disabled={desdobramentoLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {desdobramentoLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <FileCode className="mr-2 h-4 w-4" />
                            Gerar Pseudo-Codigo
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-zinc-400">Pseudo-Codigo TypeScript</h4>
                        <Button
                          onClick={handleCopyDesdobramento}
                          variant="outline"
                          className="border-zinc-700 text-zinc-300 text-sm"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">{desdobramento}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="bg-zinc-800" />

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCopySpec}
                variant="outline"
                className="border-zinc-700 text-zinc-300"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copiar Markdown
              </Button>
              <Button
                onClick={handleCopyJira}
                variant="outline"
                className="border-zinc-700 text-zinc-300"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar para Jira
              </Button>
              <Button
                onClick={handleCopyBitrix}
                variant="outline"
                className="border-zinc-700 text-zinc-300"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar para Bitrix
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-zinc-700 text-zinc-300"
              >
                <FileText className="mr-2 h-4 w-4" />
                Nova Demanda
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}