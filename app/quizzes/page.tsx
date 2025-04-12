'use client'
import QuizCard from '@/components/quiz/quiz-card'
import { useQuizzes } from '@/hooks/quiz/useQuizzes'
import { LoadingSpinner } from '@/components/LoadingSpinner'


export default function QuizzesPage() {
  const { quizzes, isLoading, error } = useQuizzes()

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div>
        <h2 className='text-xl font-normal text-red-500'>
          Failed to load quizzes
        </h2>
        <p className='text-muted-foreground mt-2'>
          Please try again later or check your connection.
        </p>
      </div>
    )
  }

  return (
    <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8 pt-8 mb-16'>
      <div className='mb-16'>
        <h1 className='text-4xl mb-2'>Quizzes</h1>
        <p className='text-muted-foreground max-w-2xl'>
          Test your Python knowledge with our interactive quizzes. Each quiz is
          thoughtfully designed to reinforce key concepts from our tutorials and
          help you master Python programming skills effectively and confidently.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className='text-center py-12'>
          <h2 className='text-xl font-normal'>No quizzes available</h2>
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
              imageUrl={quiz.imageUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
