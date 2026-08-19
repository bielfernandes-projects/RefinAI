'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

const moduleNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/tradutor': 'Tradutor de Demanda',
  '/dashboard/priorizador': 'Priorizador',
  '/dashboard/tradutor-reverso': 'Tradutor Reverso',
  '/dashboard/desdobrador': 'Desdobrador',
  '/dashboard/fatiador': 'Fatiador de Epicos',
  '/dashboard/release-notes': 'Release Notes',
  '/dashboard/roadmap': 'Roadmap',
  '/dashboard/simulador': 'Simulador PSPO',
  '/dashboard/settings': 'Configuracoes',
}

export function Header() {
  const pathname = usePathname()
  const moduleName = moduleNames[pathname] || 'Dashboard'

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-100 font-medium">{moduleName}</span>
      </nav>

      {/* Project Switcher (placeholder) */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-zinc-400">
          Projeto: <span className="text-zinc-100 font-medium">Meu Projeto</span>
        </div>
      </div>
    </header>
  )
}
