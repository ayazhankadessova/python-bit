import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface QuizFooterProps {
  currentQuestionIndex: number
  totalQuestions: number
  isAnswered: boolean
  isLastQuestion: boolean
  selectedAnswer: number
  allQuestionsAnswered: boolean
  answeredQuestionsCount: number
  onPrevious: () => void
  onNext: () => void
  onSubmitAnswer: () => void
  onFinishQuiz: () => void
}

export default function QuizFooter({
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  isLastQuestion,
  selectedAnswer,
  allQuestionsAnswered,
  answeredQuestionsCount,
  onPrevious,
  onNext,
  onSubmitAnswer,
  onFinishQuiz,
}: QuizFooterProps) {
  return (
    <footer className='sticky bottom-0 bg-background flex items-center justify-between px-6 py-3 border-t border-muted flex-shrink-0'>
      <Button
        variant='outline'
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Previous
      </Button>

      <div className='flex-1 flex justify-center'>
        <span className='px-3 py-1 bg-muted rounded-full text-xs'>
          {currentQuestionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {!isAnswered ? (
        <Button onClick={onSubmitAnswer} disabled={selectedAnswer === -1}>
          Submit
        </Button>
      ) : isLastQuestion ? (
        <Button
          onClick={onFinishQuiz}
          variant='default'
          className={
            allQuestionsAnswered ? 'bg-green-600 hover:bg-green-700' : ''
          }
        >
          Finish Quiz
          {!allQuestionsAnswered &&
            ` (${answeredQuestionsCount}/${totalQuestions})`}
        </Button>
      ) : (
        <Button onClick={onNext}>
          Next
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      )}
    </footer>
  )
}
