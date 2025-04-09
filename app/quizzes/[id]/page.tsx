'use client'

import { useQuiz } from '@/hooks/quiz/useQuizzes'
import QuizComponent from '@/components/quiz/quiz-component'
import { notFound } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function QuizPage({ params }: { params: { id: string } }) {
  const { quiz, isLoading, error } = useQuiz(params.id)

  useEffect(() => {
    if (error) {
      notFound()
    }
  }, [error])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!quiz) {
    return notFound()
  }

  return <QuizComponent quiz={quiz} />
}
