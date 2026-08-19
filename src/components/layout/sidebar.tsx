'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MessageSquare,
  ArrowLeftRight,
  Scissors,
  FileText,
  Map,
  GraduationCap,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

const modules = [
  {
    name: 'Tradutor de Demanda',
    href: '/dashboard/tradutor',
    icon: MessageSquare,
    description: 'Transforma seu "preciso disso aí" em spec técnica decente. IA faz o trabalho chato. Gera RICE/GUT e pseudo-codigo.',
  },
  {
    name: 'Tradutor Reverso',
    href: '/dashboard/tradutor-reverso',
    icon: ArrowLeftRight,
    description: 'Pega spec técnica e vira linguagem de humano. Pra stakeholder não dormir na reunião.',
  },
  {
    name: 'Fatiador de Epicos',
    href: '/dashboard/fatiador',
    icon: Scissors,
    description: 'Corta épico gordo em stories verticais. Sem enrolação, pronto pro sprint.',
  },
  {
    name: 'Release Notes',
    href: '/dashboard/release-notes',
    icon: FileText,
    description: 'Gera 3 versões: pro time, pro cliente, changelog Markdown. Copy-paste e tchau.',
  },
  {
    name: 'Roadmap',
    href: '/dashboard/roadmap',
    icon: Map,
    description: 'Now / Next / Later + OKRs. Selecione demandas e a IA monta o plano.',
  },
  {
    name: 'Simulador PSPO',
    href: '/dashboard/simulador',
    icon: GraduationCap,
    description: 'Treino pra certificação PSPO I/II. Questões reais, feedback da IA, zero estresse.',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex flex-col h-screen border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-zinc-100">RefinAI</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Modules */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {modules.map((mod) => {
            const isActive = pathname === mod.href
            return (
              <Tooltip key={mod.href}>
                <TooltipTrigger className="relative isolate">
                  <Link
                    href={mod.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                    )}
                  >
                    <mod.icon className="h-4 w-4 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    {!collapsed && <span>{mod.name}</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" className="max-w-xs text-zinc-100 bg-zinc-900 border border-zinc-700 px-3 py-2">
                  {mod.description}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        <Separator className="bg-zinc-800" />

        {/* Footer */}
        <div className="p-2 space-y-1 flex flex-col">
          <Tooltip>
            <TooltipTrigger className="relative isolate">
              <Link
                href="/dashboard/settings"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
                  pathname === '/dashboard/settings'
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                )}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Configurações</span>}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-900 border border-zinc-700">
              Suas keys de IA, projeto padrão e conta
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="relative isolate">
              <button
                onClick={async () => {
                  await fetch('/api/auth/signout', { method: 'POST' })
                  router.push('/login')
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors w-full"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Sair</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-900 border border-zinc-700">
              Sair da conta
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}