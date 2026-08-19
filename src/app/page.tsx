import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-white font-bold text-3xl">R</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            RefinAI
          </h1>
          <p className="text-xl text-zinc-400">
            O Canivete Suico do Product Owner
          </p>
        </div>

        {/* Description */}
        <p className="max-w-md text-zinc-500 leading-relaxed">
          Refine demandas, priorize com IA, gere especificacoes tecnicas e simule provas PSPO.
        </p>

        {/* CTA */}
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Entrar
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
              Demo (sem auth)
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-sm text-zinc-600 mt-8">
          Brasil-first. Feito com IA para Product Owners brasileiros.
        </p>
      </main>
    </div>
  )
}
