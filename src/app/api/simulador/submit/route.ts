import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { level, mode, answers, questionIds } = await request.json()
  // answers: array of selected option indices or strings
  // questionIds: array of question ids matching answers

  if (!level || !mode || !answers || !questionIds || answers.length !== questionIds.length) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // fetch correct answers
  const { data: questions, error: qError } = await supabase
    .from('simulator_questions')
    .select('id, correct_answer, explanation')
    .in('id', questionIds)

  if (qError) {
    console.error('Error fetching questions for grading:', qError)
    return NextResponse.json({ error: 'Failed to grade' }, { status: 500 })
  }

  const questionMap = new Map(questions?.map(q => [q.id, q]) || [])
  let correct = 0
  const details = answers.map((ans: string, idx: number) => {
    const q = questionMap.get(questionIds[idx])
    const isCorrect = q && ans === q.correct_answer
    if (isCorrect) correct++
    return {
      questionId: questionIds[idx],
      selected: ans,
      correct: q?.correct_answer,
      explanation: q?.explanation,
      isCorrect
    }
  })

  const total = answers.length
  const score = total > 0 ? Math.round((correct / total) * 100) : 0
  const passed = score >= 85 // typical PSPO pass threshold

  // store result
  const { error: insertError } = await supabase
    .from('simulator_results')
    .insert({
      user_id: user.id,
      level,
      mode,
      score,
      passed,
      history_log: details,
    })

  if (insertError) {
    console.error('Error saving result:', insertError)
    // don't fail response
  }

  return NextResponse.json({ score, passed, total, correct, details })
}