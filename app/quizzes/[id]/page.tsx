// app/quiz/[id]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import QuizComponent from '@/components/quiz/quiz-component'
import { Quiz } from '@/types/quiz/quiz'

// This would typically be a database query
async function getQuizData(id: string): Promise<Quiz | null> {
  try {
    // In a real application, you would fetch this from your API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/quiz/${id}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    )

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Failed to fetch quiz:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const quiz = await getQuizData(params.id)

  if (!quiz) {
    return {
      title: 'Quiz Not Found',
    }
  }

  return {
    title: `${quiz.title} | PythonBit`,
    description: quiz.description,
  }
}

export default async function QuizPage({ params }: { params: { id: string } }) {
  const quiz = await getQuizData(params.id)

  if (!quiz) {
    notFound()
  }

  return (
    <main className='container mx-auto py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <Suspense
          fallback={<div className='py-12 text-center'>Loading quiz...</div>}
        >
          <QuizComponent quiz={quiz} />
        </Suspense>
      </div>
    </main>
  )
}
