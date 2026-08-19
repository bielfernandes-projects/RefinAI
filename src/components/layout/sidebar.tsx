'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MessageSquare,
  BarChart3,
  ArrowLeftRight,
  FileCode,
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

const modules = [
  { name: 'Tradutor de Demanda', href: '/dashboard/tradutor', icon: MessageSquare },
  { name: 'Priorizador', href: '/dashboard/priorizador', icon: BarChart3 },
  { name: 'Tradutor Reverso', href: '/dashboard/tradutor-reverso', icon: ArrowLeftRight },
  { name: 'Desdobrador', href: '/dashboard/desdobrador', icon: FileCode },
  { name: 'Fatiador de Epicos', href: '/dashboard/fatiador', icon: Scissors },
  { name: 'Release Notes', href: '/dashboard/release-notes', icon: FileText },
  { name: 'Roadmap', href: '/dashboard/roadmap', icon: Map },
  { name: 'Simulador PSPO', href: '/dashboard/simulador', icon: GraduationCap },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  return (
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
            <Link
              key={mod.href}
              href={mod.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              )}
            >
              <mod.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{mod.name}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-zinc-800" />

      {/* Footer */}
      <div className="p-2 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-indigo-500/10 text-indigo-400'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
          )}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Configuracoes</span>}
        </Link>
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
      </div>
    </aside>
  )
}
