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
} from 'lucide-react'

interface Question {
  id: number
  text: string
  category: string
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  function handleCopySpec() {
    navigator.clipboard.writeText(spec)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyJira() {
    // Convert markdown to Jira wiki markup (basic)
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
    // Convert markdown to plain text with basic formatting
    const bitrix = spec
      .replace(/^### (.+)$/gm, '[$1]')
      .replace(/^## (.+)$/gm, '[=$1=]')
      .replace(/^# (.+)$/gm, '[==$1==]')
      .replace(/\*\*(.+?)\*\*/g, '[$1]')

    navigator.clipboard.writeText(bitrix)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setRawInput('')
    setQuestions([])
    setAnswers({})
    setSpec('')
    setPhase('input')
    setError(null)
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
                  Pronta para copiar e colar no Jira, Bitrix ou salvar como demanda
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Check className="mr-1 h-3 w-3" />
                Gerada
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-700">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="markdown" className="data-[state=active]:bg-zinc-700">
                  Markdown
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
