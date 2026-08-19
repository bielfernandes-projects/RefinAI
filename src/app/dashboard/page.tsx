import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  MessageSquare,
  BarChart3,
  ArrowLeftRight,
  FileCode,
  Scissors,
  FileText,
  Map,
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'

const modules = [
  {
    name: 'Tradutor de Demanda',
    description: 'Transforme rascunhos em especificacoes tecnicas estruturadas',
    icon: MessageSquare,
    href: '/dashboard/tradutor',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    name: 'Priorizador',
    description: 'RICE e GUT lado a lado com ranking paralelo',
    icon: BarChart3,
    href: '/dashboard/priorizador',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    name: 'Tradutor Reverso',
    description: 'Nivele sua demanda para qualquer audiencia',
    icon: ArrowLeftRight,
    href: '/dashboard/tradutor-reverso',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    name: 'Desdobrador',
    description: 'Quebre complexidade em pseudo-codigo tecnico',
    icon: FileCode,
    href: '/dashboard/desdobrador',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    name: 'Fatiador de Epicos',
    description: 'Vertical slicing com historias de usuario',
    icon: Scissors,
    href: '/dashboard/fatiador',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    name: 'Release Notes',
    description: '3 artefatos prontos para comunicar ao time',
    icon: FileText,
    href: '/dashboard/release-notes',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    name: 'Roadmap',
    description: 'Now/Next/Later com OKRs e export',
    icon: Map,
    href: '/dashboard/roadmap',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    name: 'Simulador PSPO',
    description: 'Estude e simule as provas PSPO I e II',
    icon: GraduationCap,
    href: '/dashboard/simulador',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400">
          Bem-vindo ao RefinAI. Selecule um modulo para comecar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className={`w-10 h-10 rounded-lg ${mod.bg} flex items-center justify-center mb-2`}>
                  <mod.icon className={`h-5 w-5 ${mod.color}`} />
                </div>
                <CardTitle className="text-zinc-100 text-lg">{mod.name}</CardTitle>
                <CardDescription className="text-zinc-400">
                  {mod.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
