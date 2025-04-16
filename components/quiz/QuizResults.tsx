import { CircularProgress } from '@/components/ui/circular-progress-bar'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Quiz, QuizProgress } from '@/types/quiz/quiz'

interface ScoreData {
  correctAnswers: number
  totalQuestions: number
  percentage: number
}

interface QuizResultsProps {
  quiz: Quiz
  score: ScoreData
  selectedAnswers: number[]
  progress: QuizProgress | null
  theme: string | undefined
  onRetakeQuiz: () => void
  renderQuestionText: (text: string) => React.ReactNode
}

export default function QuizResults({
  quiz,
  score,
  selectedAnswers,
  progress,
  theme,
  onRetakeQuiz,
  renderQuestionText,
}: QuizResultsProps) {
  const passingScore = 70
  const incorrectAnswers = score.totalQuestions - score.correctAnswers
  const isDarkTheme = theme === 'dark'

  return (
    <div className='w-full mx-auto -mt-8'>
      <div className='justify-center items-center flex flex-col bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 dark:from-purple-900 dark:via-purple-950 dark:to-purple-900 py-8 md:py-12 lg:py-16 md:px-8 sm:px-8 px-8 rounded-lg shadow-md'>
        <h2 className='text-2xl mb-2 text-foreground dark:text-foreground font-bold'>
          Quiz Summary
        </h2>
        <h1 className='text-5xl mb-6 text-foreground dark:text-foreground'>
          {quiz.title}
        </h1>

        <div className='flex flex-col md:flex-row items-center justify-center md:space-x-8 w-full max-w-xl'>
          <div className='mb-6 md:mb-0'>
            <CircularProgress
              percentage={score.percentage}
              size={180}
              strokeWidth={12}
              primaryColor={isDarkTheme ? 'stroke-teal-400' : 'stroke-teal-500'}
              secondaryColor={
                isDarkTheme ? 'stroke-gray-700' : 'stroke-gray-50'
              }
              textSize='text-5xl'
              textClassName={isDarkTheme ? 'text-white' : 'text-black'}
            />
          </div>

          <div className='text-center md:text-left'>
            <p className='text-lg font-normal text-foreground mb-5'>
              {score.percentage >= passingScore
                ? 'Congratulations! You passed!'
                : `Get ${passingScore}% to pass`}
              {progress && (
                <>
                  {progress.highestScore && (
                    <> | Highest Score: {progress.highestScore}%</>
                  )}
                </>
              )}
            </p>

            <div className='flex justify-center md:justify-start space-x-6 mb-6'>
              <div className='flex items-center space-x-2'>
                <CheckCircle
                  className='text-green-500 m-0 flex-shrink-0'
                  size={30}
                />
                <span className='text-2xl font-semibold'>
                  {score.correctAnswers}
                </span>
                <span className='text-2xl font-semibold'>correct</span>
              </div>

              <div className='flex items-center space-x-2'>
                <AlertCircle
                  className='text-red-500 m-0 flex-shrink-0'
                  size={30}
                />
                <span className='text-2xl font-semibold'>
                  {incorrectAnswers}
                </span>
                <span className='text-2xl font-semibold'>incorrect</span>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 mt-4 items-baseline'>
              <Button variant='outline' className='font-semibold text-md'>
                <Link href={`/tutorials/${quiz.tutorialId}`}>
                  View Tutorial
                </Link>
              </Button>
              <Button
                variant='outline'
                className='text-md font-semibold'
                onClick={onRetakeQuiz}
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='xl:px-48 lg:px-32 md:px-16 sm:px-8 px-8'>
        <div className='mt-12'>
          <p className='text-xl mb-4 font-semibold'>Review Your Answers</p>
          {quiz.questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.correctAnswer

            return (
              <div key={question.id} className='mb-12'>
                {/* Top section with icon and question number */}
                <div className='text-center mb-6'>
                  <div className='flex items-center justify-center'>
                    <div className='border-t border-gray-300 dark:border-gray-600 flex-grow'></div>
                    <div className='mx-4 flex items-center'>
                      {isCorrect ? (
                        <CheckCircle
                          className='text-green-500 flex-shrink-0 mx-2'
                          size={24}
                        />
                      ) : (
                        <AlertCircle
                          className='text-red-500 flex-shrink-0 mx-2'
                          size={24}
                        />
                      )}
                      <span className='font-normal text-md'>
                        Question {index + 1}
                      </span>
                    </div>
                    <div className='border-t border-gray-300 dark:border-gray-600 flex-grow'></div>
                  </div>
                </div>

                <div className='mb-4'>
                  <div className='text-xl font-normal'>
                    {renderQuestionText(question.question)}
                  </div>
                </div>

                {question.imageUrl && (
                  <div className='flex justify-center mb-4'>
                    <Image
                      src={question.imageUrl}
                      alt={`Question ${index + 1} image`}
                      width={400}
                      height={300}
                      className='rounded-md'
                    />
                  </div>
                )}

                <div className='bg-card border rounded-lg p-4 mb-3'>
                  <p className='font-normal'>
                    Your answer:{' '}
                    {selectedAnswers[index] !== -1
                      ? question.options[selectedAnswers[index]]
                      : 'Not answered'}
                  </p>
                  {!isCorrect && (
                    <p className='text-green-700 dark:text-green-400 mt-2'>
                      Correct answer: {question.options[question.correctAnswer]}
                    </p>
                  )}
                </div>

                {/* Explanation Card - only shown if there is an explanation */}
                {question.explanation && (
                  <div className='bg-muted border rounded-lg p-4'>
                    <strong className='block mb-1'>Explanation:</strong>
                    {renderQuestionText(question.explanation)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <footer className='sticky bottom-0 bg-background flex items-center px-6 py-3 border-t border-muted flex-shrink-0 justify-end'>
        <Button asChild>
          <Link href={`/quizzes`}>Back to Quizzes</Link>
        </Button>
      </footer>
    </div>
  )
}
