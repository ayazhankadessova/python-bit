'use client'

import { useQuiz } from '@/hooks/quiz/useQuizzes'
import QuizComponent from '@/components/quiz/quiz-component'
import { notFound } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function QuizPage() {
  const { quiz, isLoading, error } = useQuiz('python101-1-what-is-python-quiz')

  useEffect(() => {
    if (error) {
      notFound()
    }
  }, [error])

  if (isLoading) {
    return (
      <main className='container mx-auto py-8 px-4'>
        <div className='max-w-4xl mx-auto text-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='mt-4'>Loading quiz...</p>
        </div>
      </main>
    )
  }

  if (!quiz) {
    return notFound()
  }

  return (
    <main className='container mx-auto py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <QuizComponent quiz={quiz} />
      </div>
    </main>
  )
}
