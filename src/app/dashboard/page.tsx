import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  MessageSquare,
  ArrowLeftRight,
  Scissors,
  FileText,
  Map,
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'

const modules = [
  {
    name: 'Tradutor de Demanda',
    description: 'Transforma seu "preciso disso aí" em spec técnica decente. IA faz o trabalho chato. Gera RICE/GUT e pseudo-codigo.',
    icon: MessageSquare,
    href: '/dashboard/tradutor',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    name: 'Tradutor Reverso',
    description: 'Pega spec técnica e vira linguagem de humano. Pra stakeholder não dormir na reunião.',
    icon: ArrowLeftRight,
    href: '/dashboard/tradutor-reverso',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    name: 'Fatiador de Epicos',
    description: 'Corta épico gordo em stories verticais. Sem enrolação, pronto pro sprint.',
    icon: Scissors,
    href: '/dashboard/fatiador',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    name: 'Release Notes',
    description: 'Gera 3 versões: pro time, pro cliente, changelog Markdown. Copy-paste e tchau.',
    icon: FileText,
    href: '/dashboard/release-notes',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    name: 'Roadmap',
    description: 'Now / Next / Later + OKRs. Selecione demandas e a IA monta o plano.',
    icon: Map,
    href: '/dashboard/roadmap',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    name: 'Simulador PSPO',
    description: 'Treino pra certificação PSPO I/II. Questões reais, feedback da IA, zero estresse.',
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
          Bem-vindo ao RefinAI. Selecione um modulo para comecar.
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