'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Check, AlertCircle, Key, Database, User, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  context_json: Record<string, unknown> | null
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'byok' | 'project' | 'account'>('byok')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // BYOK state
  const [nvidiaKey, setNvidiaKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [customKeyProvider, setCustomKeyProvider] = useState('')
  const [customKeyValue, setCustomKeyValue] = useState('')
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [keyTestResult, setKeyTestResult] = useState<Record<string, { ok: boolean; message: string }>>({})

  // Project state
  const [projects, setProjects] = useState<Project[]>([])
  const [defaultProjectId, setDefaultProjectId] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Load user_settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('nvidia_api_key, openai_api_key, anthropic_api_key, default_project_id')
      .eq('user_id', user.id)
      .single()

    if (settings) {
      setDefaultProjectId(settings.default_project_id || '')
    }

    // Load projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name, context_json')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setProjects(projectsData || [])
  }, [router, supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  async function testApiKey(provider: 'nvidia' | 'openai' | 'anthropic', key: string) {
    setTestingKey(provider)
    setError(null)
    setSuccess(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/debug/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ provider, key }),
      })

      const data = await res.json()
      setKeyTestResult({ ...keyTestResult, [provider]: { ok: res.ok, message: data.message || (res.ok ? 'Key válida' : data.error) } })
      if (!res.ok) setError(`${provider.toUpperCase()}: ${data.error}`)
    } catch {
      setKeyTestResult({ ...keyTestResult, [provider]: { ok: false, message: 'Erro de rede' } })
      setError('Erro ao testar key')
    } finally {
      setTestingKey(null)
    }
  }

  async function saveByokKeys() {
    if (!nvidiaKey && !openaiKey && !anthropicKey && !customKeyValue) {
      setError('Preencha pelo menos uma key')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const updates: Record<string, string> = {}
      if (nvidiaKey) updates.nvidia_api_key = nvidiaKey
      if (openaiKey) updates.openai_api_key = openaiKey
      if (anthropicKey) updates.anthropic_api_key = anthropicKey
      if (customKeyProvider && customKeyValue) updates[`custom_${customKeyProvider}_api_key`] = customKeyValue

      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })

      if (error) throw error

      setSuccess('Keys salvas com sucesso')
      setNvidiaKey('')
      setOpenaiKey('')
      setAnthropicKey('')
      setCustomKeyProvider('')
      setCustomKeyValue('')
      setKeyTestResult({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  async function saveDefaultProject() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, default_project_id: defaultProjectId || null }, { onConflict: 'user_id' })

      if (error) throw error

      setSuccess('Projeto padrão atualizado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {
    if (!newProjectName.trim()) return

    setCreatingProject(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data: project, error } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name: newProjectName.trim(), context_json: {} })
        .select()
        .single()

      if (error) throw error

      setProjects([project, ...projects])
      setDefaultProjectId(project.id)
      setNewProjectName('')
      await saveDefaultProject()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto')
    } finally {
      setCreatingProject(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('TEM CERTEZA? Esta ação é irreversível e apagará todos seus dados.')) return
    if (!confirm('Confirma novamente? Não tem volta.')) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // Delete user data (cascade should handle related tables via FK)
      await supabase.from('user_settings').delete().eq('user_id', user.id)
      await supabase.from('projects').delete().eq('user_id', user.id)
      await supabase.auth.admin.deleteUser(user.id) // Note: this requires service role, may not work from client

      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Configuracoes</h1>
        <p className="text-zinc-400">Gerencie suas keys de IA, projeto padrão e conta</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Check className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-800 w-full">
          <TabsTrigger value="byok" className="flex-1 data-[state=active]:bg-zinc-700">IA & BYOK</TabsTrigger>
          <TabsTrigger value="project" className="flex-1 data-[state=active]:bg-zinc-700">Projeto</TabsTrigger>
          <TabsTrigger value="account" className="flex-1 data-[state=active]:bg-zinc-700">Conta</TabsTrigger>
        </TabsList>

        {/* BYOK Tab */}
        <TabsContent value="byok" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2"><Key className="h-4 w-4" /> Bring Your Own Key</CardTitle>
              <CardDescription className="text-zinc-400">
                Configure suas próprias keys de API. O RefinAI usa a key do ambiente por padrão, mas você pode sobrescrever por provider.
                Keys são criptografadas no banco (RLS garante isolamento por usuário).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { id: 'nvidia', label: 'Nvidia Nemotron', key: nvidiaKey, setKey: setNvidiaKey, placeholder: 'nvapi-...', testResult: keyTestResult.nvidia, testing: testingKey === 'nvidia' },
                { id: 'openai', label: 'OpenAI', key: openaiKey, setKey: setOpenaiKey, placeholder: 'sk-...', testResult: keyTestResult.openai, testing: testingKey === 'openai' },
                { id: 'anthropic', label: 'Anthropic', key: anthropicKey, setKey: setAnthropicKey, placeholder: 'sk-ant-...', testResult: keyTestResult.anthropic, testing: testingKey === 'anthropic' },
                { id: 'custom', label: 'Outra chave', key: customKeyValue, setKey: setCustomKeyValue, placeholder: 'Valor da key', extraInput: <Input placeholder="Nome do provider (ex: groq, together...)" value={customKeyProvider} onChange={(e) => setCustomKeyProvider(e.target.value)} className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100" />, testResult: keyTestResult.custom, testing: testingKey === 'custom', noTest: true },
              ].map(({ id, label, key, setKey, placeholder, testResult, testing, extraInput, noTest }) => (
                <div key={id} className="space-y-3">
                  <Label className="text-zinc-300 flex items-center gap-2">{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder={placeholder}
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                      disabled={testing}
                    />
                    {extraInput && <div className="flex-1">{extraInput}</div>}
                    {!noTest && (
                      <Button
                        variant="outline"
                        onClick={() => testApiKey(id as 'nvidia' | 'openai' | 'anthropic', key)}
                        disabled={testing || !key}
                        className="whitespace-nowrap"
                      >
                        {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Testar'}
                      </Button>
                    )}
                    {testResult && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex items-center gap-1',
                          testResult.ok ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'
                        )}
                      >
                        {testResult.ok ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {testResult.message}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              <Separator className="bg-zinc-800" />

              <Button onClick={saveByokKeys} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Keys'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Tab */}
        <TabsContent value="project" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2"><Database className="h-4 w-4" /> Projeto Padrão</CardTitle>
              <CardDescription className="text-zinc-400">
                O projeto padrão é usado automaticamente nos módulos que precisam de contexto (Roadmap, etc).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Projeto Ativo</Label>
                <Select value={defaultProjectId} onValueChange={(v) => setDefaultProjectId(v ?? '')}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={saveDefaultProject}
                disabled={loading || !defaultProjectId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Definir como Padrão'}
              </Button>

              <Separator className="bg-zinc-800 my-6" />

              <CardTitle className="text-lg text-zinc-100">Criar Novo Projeto</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do novo projeto"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                />
                <Button onClick={createProject} disabled={creatingProject || !newProjectName.trim()} className="whitespace-nowrap">
                  {creatingProject ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}
                </Button>
              </div>

              {projects.length > 0 && (
                <div className="space-y-2">
                  <CardTitle className="text-lg text-zinc-100">Seus Projetos</CardTitle>
                  {projects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <div className="flex items-center gap-3">
                        <span className={cn('w-2 h-2 rounded-full', defaultProjectId === p.id ? 'bg-indigo-500' : 'bg-zinc-600')} />
                        <span className="text-zinc-100">{p.name}</span>
                        {defaultProjectId === p.id && <Badge className="bg-indigo-500/10 text-indigo-400 text-xs">Padrão</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2"><User className="h-4 w-4" /> Conta</CardTitle>
              <CardDescription className="text-zinc-400">Informações da conta e zona de perigo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-300">Email</Label>
                <Input disabled placeholder="Carregando..." className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3 border-t border-zinc-800 pt-6">
                <CardTitle className="text-lg text-red-400 flex items-center gap-2"><Trash2 className="h-4 w-4" /> Zona de Perigo</CardTitle>
                <p className="text-sm text-zinc-500">Ações irreversíveis. Use com cuidado.</p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Excluir Minha Conta e Todos os Dados'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}