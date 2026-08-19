'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const steps = [
  { id: 1, title: 'Seu Projeto', description: 'Nomeie seu primeiro projeto' },
  { id: 2, title: 'Contexto', description: 'Conte sobre seu time e stack' },
  { id: 3, title: 'Pronto!', description: 'Comece a refinar' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [projectName, setProjectName] = useState('')

  // Step 2
  const [nicho, setNicho] = useState('')
  const [stack, setStack] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [hasQa, setHasQa] = useState('nao')
  const [methodology, setMethodology] = useState('scrum')

  const supabase = createClient()

  async function handleFinish() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectName || 'Meu Projeto',
        context_json: {
          nicho: nicho || null,
          stack: stack || null,
          team_size: teamSize || null,
          has_qa: hasQa === 'sim',
          methodology,
        },
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error creating project:', projectError)
      setLoading(false)
      return
    }

    // Create default statuses
    const defaultStatuses = [
      { name: 'Backlog', order: 0, color: '#6b7280', phase: null, is_default: true },
      { name: 'Em refinamento', order: 1, color: '#f59e0b', phase: 'refining', is_default: true },
      { name: 'Pronto', order: 2, color: '#10b981', phase: 'finished', is_default: true },
    ]

    await supabase.from('project_statuses').insert(
      defaultStatuses.map((s) => ({
        project_id: project.id,
        ...s,
      }))
    )

    // Create user_settings if not exists
    await supabase.from('user_settings').upsert(
      {
        user_id: user.id,
        default_project_id: project.id,
      },
      { onConflict: 'user_id' }
    )

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="text-2xl font-bold text-zinc-100">RefinAI</span>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                s.id <= step ? 'w-8 bg-indigo-500' : 'w-8 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Project Name */}
        {step === 1 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">{steps[0].title}</CardTitle>
              <CardDescription className="text-zinc-400">
                {steps[0].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-zinc-300">
                  Nome do Projeto
                </Label>
                <Input
                  id="projectName"
                  placeholder="Ex: App de Delivery"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Proximo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Context */}
        {step === 2 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">{steps[1].title}</CardTitle>
              <CardDescription className="text-zinc-400">
                {steps[1].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nicho" className="text-zinc-300">
                  Nicho / Segmento
                </Label>
                <Input
                  id="nicho"
                  placeholder="Ex: Fintech, E-commerce, EdTech"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stack" className="text-zinc-300">
                  Stack Tecnologica
                </Label>
                <Input
                  id="stack"
                  placeholder="Ex: React, Node.js, PostgreSQL"
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-zinc-300">
                    Tamanho do Time
                  </Label>
                  <Select value={teamSize} onValueChange={(v) => setTeamSize(v ?? '')}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="solo">Solo (1)</SelectItem>
                      <SelectItem value="pequeno">Pequeno (2-5)</SelectItem>
                      <SelectItem value="medio">Medio (6-15)</SelectItem>
                      <SelectItem value="grande">Grande (16+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hasQa" className="text-zinc-300">
                    Time tem QA?
                  </Label>
                  <Select value={hasQa} onValueChange={(v) => setHasQa(v ?? 'nao')}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Nao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodology" className="text-zinc-300">
                  Metodologia
                </Label>
                <Select value={methodology} onValueChange={(v) => setMethodology(v ?? 'scrum')}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="scrum">Scrum</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                    <SelectItem value="scrum-ban">Scrumban</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Proximo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100">{steps[2].title}</CardTitle>
              <CardDescription className="text-zinc-400">
                {steps[2].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <p className="text-zinc-300">
                  Projeto <span className="font-semibold text-zinc-100">{projectName || 'Meu Projeto'}</span> criado!
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  Configuracoes salvas. Voce pode alterar depois em Configuracoes.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Comecar a Refinar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
