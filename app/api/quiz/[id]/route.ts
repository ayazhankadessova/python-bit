import { NextResponse } from 'next/server'
import { Quiz } from '@/types/quiz/quiz'

import quiz1 from '@/config/quiz/python101-1-what-is-python-quiz.json'
import quiz2 from '@/config/quiz/python101-2-variables-quiz.json'
import quiz3 from '@/config/quiz/python101-3-collections-quiz.json'
import quiz4 from '@/config/quiz/python101-4-operators-quiz.json'
import quiz5 from '@/config/quiz/python101-5-string-formatting-quiz.json'


const quizzes: Record<string, Quiz> = {
  "python101-1-what-is-python-quiz":quiz1,
  "python101-2-variables-quiz":quiz2,
  "python101-3-collections-quiz":quiz3,
  "python101-4-operators-quiz":quiz4,
  "python101-5-string-formatting-quiz":quiz5
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quizId = params.id
  const quiz = quizzes[quizId]

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  return NextResponse.json(quiz)
}
