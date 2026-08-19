'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowRight, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react'

interface Question {
  id: string
  level: string
  topic: string
  question_type: string
  question_text: string
  options: { text: string; value: string }[]
  correct_answer: string
  explanation: string
}

interface AnswerDetail {
  questionId: string
  selected: string
  correct: string
  explanation: string
  isCorrect: boolean
}

export default function SimuladorPage() {
  const supabase = createClient()
  const [step, setStep] = useState<'config' | 'quiz' | 'result'>('config')
  const [level, setLevel] = useState<'PSPO I' | 'PSPO II'>('PSPO I')
  const [mode, setMode] = useState<'study' | 'exam'>('study')
  const [questionCount, setQuestionCount] = useState(10)
  const [topic, setTopic] = useState('')

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // result state
  const [result, setResult] = useState<{
    score: number
    passed: boolean
    total: number
    correct: number
    details: any[]
  } | null>(null)

  async function loadQuestions() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        level,
        count: questionCount.toString(),
      })
      if (topic) params.set('topic', topic)

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/simulador/questions?${params}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar questões')
      setQuestions(data.questions || [])
      setCurrentIdx(0)
      setAnswers({})
      setShowExplanation(false)
      setStep('quiz')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer(qId: string, value: string) {
    setAnswers(prev => ({ ...prev, [qId]: value }))
    if (mode === 'study') {
      setShowExplanation(true)
    }
  }

  function nextQuestion() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setShowExplanation(false)
    } else {
      finishQuiz()
    }
  }

  function prevQuestion() {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
      setShowExplanation(false)
    }
  }

  async function finishQuiz() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const questionIds = questions.map(q => q.id)
      const answerValues = questionIds.map(qId => answers[qId] || '')
      const res = await fetch('/api/simulador/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ level, mode, answers: answerValues, questionIds })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar')
      setResult(data)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar')
    } finally {
      setLoading(false)
    }
  }

  function restart() {
    setStep('config')
    setResult(null)
    setQuestions([])
    setAnswers({})
  }

  const currentQuestion = questions[currentIdx]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Simulador PSPO</h1>
        <p className="text-zinc-400">Prepare-se para a certificação com questões reais e feedback da IA</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Config Step */}
      {step === 'config' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Configurar Simulado</CardTitle>
            <CardDescription className="text-zinc-400">Escolha o nível, modo e número de questões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-zinc-300">Nível da Certificação</Label>
              <RadioGroup value={level} onValueChange={(v) => setLevel(v as 'PSPO I' | 'PSPO II')} className="grid grid-cols-2 gap-4">
                <RadioGroupItem value="PSPO I" className="flex items-center gap-2 p-4 border border-zinc-700 rounded-lg hover:border-indigo-500 transition-colors">
                  <span className="font-medium">PSPO I</span>
                  <span className="text-xs text-zinc-500 ml-auto">Fundamentos</span>
                </RadioGroupItem>
                <RadioGroupItem value="PSPO II" className="flex items-center gap-2 p-4 border border-zinc-700 rounded-lg hover:border-indigo-500 transition-colors">
                  <span className="font-medium">PSPO II</span>
                  <span className="text-xs text-zinc-500 ml-auto">Avançado</span>
                </RadioGroupItem>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-300">Modo</Label>
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'study' | 'exam')} className="grid grid-cols-2 gap-4">
                <RadioGroupItem value="study" className="flex items-center gap-2 p-4 border border-zinc-700 rounded-lg hover:border-indigo-500 transition-colors">
                  <span className="font-medium">Estudo</span>
                  <span className="text-xs text-zinc-500 ml-auto">Feedback imediato</span>
                </RadioGroupItem>
                <RadioGroupItem value="exam" className="flex items-center gap-2 p-4 border border-zinc-700 rounded-lg hover:border-indigo-500 transition-colors">
                  <span className="font-medium">Exame</span>
                  <span className="text-xs text-zinc-500 ml-auto">Sem feedback até o fim</span>
                </RadioGroupItem>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Número de Questões</Label>
              <select value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-lg px-4 py-2 w-full md:w-48">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Tópico (opcional)</Label>
              <input
                type="text"
                placeholder="events, artifacts, roles, ebm, stakeholders, scaling"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-lg px-4 py-2"
              />
              <p className="text-xs text-zinc-500">Deixe vazio para todos os tópicos</p>
            </div>

            <Button onClick={loadQuestions} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3">
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : <><ArrowRight className="mr-2 h-4 w-4" />Iniciar Simulado</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quiz Step */}
      {step === 'quiz' && currentQuestion && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Questão {currentIdx + 1} de {questions.length}</CardTitle>
                <CardDescription className="text-zinc-400">
                  {level} • {mode === 'study' ? 'Modo Estudo' : 'Modo Exame'} • {currentQuestion.topic}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span>{currentIdx + 1}/{questions.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-100 text-lg break-words">{currentQuestion.question_text}</p>

            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={v => handleAnswer(currentQuestion.id, v)}
              className="space-y-3"
            >
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === opt.value
                const isCorrect = answers[currentQuestion.id] === currentQuestion.correct_answer
                const showIcon = mode === 'study' && showExplanation && isSelected
                return (
                  <RadioGroupItem
                    key={idx}
                    value={opt.value}
                    className="peer flex items-center gap-3 p-4 w-full border border-zinc-700 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10"
                  >
                    <span className="font-mono text-sm text-zinc-400 w-6">{String.fromCharCode(65 + idx)}</span>
                    <span className="text-zinc-100 flex-1 break-words">{opt.text}</span>
                    {mode === 'study' && showExplanation && isSelected && (
                      <span className={`ml-auto text-sm ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </span>
                    )}
                  </RadioGroupItem>
                )
              })}
            </RadioGroup>

            {mode === 'study' && showExplanation && (
              <div className={`p-4 rounded-lg border ${answers[currentQuestion.id] === currentQuestion.correct_answer ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {answers[currentQuestion.id] === currentQuestion.correct_answer ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="font-medium">
                    {answers[currentQuestion.id] === currentQuestion.correct_answer ? 'Correto!' : 'Incorreto'}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm break-words">{currentQuestion.explanation}</p>
                <p className="text-xs text-zinc-500 mt-2">Resposta correta: <span className="font-mono">{currentQuestion.correct_answer}</span></p>
              </div>
            )}

            <Separator className="bg-zinc-800" />

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevQuestion} disabled={currentIdx === 0} className="border-zinc-700 text-zinc-300">
                ← Anterior
              </Button>
              <div className="flex gap-2">
                {mode === 'study' && showExplanation && !currentQuestion.correct_answer && (
                  <Button variant="outline" onClick={() => setShowExplanation(false)} className="border-zinc-700 text-zinc-300">
                    Tentar Novamente
                  </Button>
                )}
                <Button onClick={nextQuestion} disabled={!answers[currentQuestion.id] && mode === 'exam'} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {currentIdx === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIdx(i); setShowExplanation(false); }}
                  className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                    i === currentIdx ? 'bg-indigo-600 text-white' :
                    answers[questions[i]?.id] ? 'bg-emerald-500/30 text-emerald-400' :
                    'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Step */}
      {step === 'result' && result && (
        <div className="space-y-6">
          <Card className={`bg-zinc-900 border-zinc-800 ${result.passed ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {result.passed ? (
                  <Trophy className="h-16 w-16 text-emerald-400 mx-auto" />
                ) : (
                  <RotateCcw className="h-16 w-16 text-red-400 mx-auto" />
                )}
              </div>
              <CardTitle className="text-2xl text-zinc-100">
                {result.passed ? 'Aprovado! 🎉' : 'Não Aprovado'}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                {level} • {mode === 'study' ? 'Modo Estudo' : 'Modo Exame'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-zinc-800/50">
                  <p className="text-3xl font-bold text-emerald-400">{result.score}%</p>
                  <p className="text-xs text-zinc-400">Pontuação</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-800/50">
                  <p className="text-3xl font-bold text-indigo-400">{result.correct}/{result.total}</p>
                  <p className="text-xs text-zinc-400">Acertos</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-800/50">
                  <p className="text-3xl font-bold {result.passed ? 'text-emerald-400' : 'text-red-400'}">
                    {result.passed ? '✓' : '✗'}
                  </p>
                  <p className="text-xs text-zinc-400">Status</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-zinc-300 font-medium">Revisão das Questões</h4>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {result.details.map((d: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded-lg ${d.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-zinc-400 w-6">{idx + 1}</span>
                        <span className={`font-medium ${d.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                          {d.isCorrect ? 'Correto' : 'Incorreto'}
                        </span>
                        <span className="text-xs text-zinc-500 ml-auto">{d.selected} → {d.correct}</span>
                      </div>
                      <p className="text-xs text-zinc-400 ml-7">{d.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={restart} variant="outline" className="border-zinc-700 text-zinc-300">
                  <RotateCcw className="mr-2 h-4 w-4" /> Novo Simulado
                </Button>
                <Button onClick={() => { loadQuestions(); setStep('config'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <ArrowRight className="mr-2 h-4 w-4" /> Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}