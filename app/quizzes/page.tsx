// app/quiz/page.tsx
'use client'
import QuizCard from '@/components/quiz/quiz-card'
import { useQuizzes } from '@/hooks/quiz/useQuizzes'
// import { Spinner } from '@/components/ui/spinner'


export default function QuizzesPage() {
  const { quizzes, isLoading, error } = useQuizzes()

  if (isLoading) {
    return (
      <main className='container py-8 px-4'>
        <div className='max-w-5xl mx-auto text-center py-12'>
          {/* <Spinner className='mx-auto' /> */}
          <p className='mt-4'>Loading quizzes...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className='container py-8 px-4'>
        <div className='max-w-5xl mx-auto text-center py-12'>
          <h2 className='text-xl font-medium text-red-500'>
            Failed to load quizzes
          </h2>
          <p className='text-muted-foreground mt-2'>
            Please try again later or check your connection.
          </p>
        </div>
      </main>
    )
  }

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

        {quizzes.length === 0 ? (
          <div className='text-center py-12'>
            <h2 className='text-xl font-medium'>No quizzes available</h2>
            <p className='text-muted-foreground mt-2'>
              Check back later for new quizzes to test your knowledge!
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </main>
  )
}
