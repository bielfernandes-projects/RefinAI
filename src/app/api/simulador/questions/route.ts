import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level') || 'PSPO I'
  const count = parseInt(searchParams.get('count') || '10')
  const topic = searchParams.get('topic') // optional

  let query = supabase
    .from('simulator_questions')
    .select('*')
    .eq('level', level)

  if (topic) {
    query = query.eq('topic', topic)
  }

  // random order, limit
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(count * 5) // fetch more then shuffle client-side or server-side

  if (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }

  // simple shuffle and limit
  const shuffled = data?.sort(() => 0.5 - Math.random()).slice(0, count) || []

  return NextResponse.json({ questions: shuffled })
}