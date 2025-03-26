// app/quiz/page.tsx
import { Suspense } from 'react'
import { Metadata } from 'next'
import QuizCard from '@/components/quiz/quiz-card'
import { Quiz } from '@/types/quiz/quiz'

export const metadata: Metadata = {
  title: 'All Quizzes | PythonBit',
  description: 'Test your Python knowledge with our interactive quizzes',
}

// Function to fetch all available quizzes
async function getQuizzes(): Promise<Quiz[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/quiz`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    )

    if (!response.ok) {
      return []
    }

    return response.json()
  } catch (error) {
    console.error('Failed to fetch quizzes:', error)
    return []
  }
}

// Component to render quiz cards with data
async function QuizGrid() {
  const quizzes = await getQuizzes()

  if (quizzes.length === 0) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-xl font-medium'>No quizzes available</h2>
        <p className='text-muted-foreground mt-2'>
          Check back later for new quizzes to test your knowledge!
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          id={quiz.id}
          title={quiz.title}
          description={quiz.description}
          tutorialId={quiz.tutorialId}
          questionCount={quiz.questions.length}
        />
      ))}
    </div>
  )
}

export default function QuizzesPage() {
  return (
    <main className='container py-8 px-4'>
      <div className='max-w-5xl mx-auto'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>
            Python Quizzes
          </h1>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Test your Python knowledge with our interactive quizzes. Each quiz
            is designed to reinforce concepts from our tutorials and help you
            master Python programming.
          </p>
        </div>

        <Suspense
          fallback={<div className='py-12 text-center'>Loading quizzes...</div>}
        >
          <QuizGrid />
        </Suspense>
      </div>
    </main>
  )
}
