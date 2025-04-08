import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { Question } from '@/types/quiz/quiz'

interface QuizQuestionProps {
  question: Question
  selectedAnswer: number
  isAnswered: boolean
  isCorrect: boolean
  onSelect: (answerIndex: number) => void
  renderQuestionText: (text: string) => React.ReactNode
}

export default function QuizQuestion({
  question,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onSelect,
  renderQuestionText,
}: QuizQuestionProps) {
  return (
    <div className='mb-6 mx-auto xl:px-24 lg:px-16 md:px-8 sm:px-0'>
      <p className='text-lg font-normal mb-6'>
        {renderQuestionText(question.question)}
      </p>

      {/* Display image if available */}
      {question.imageUrl && (
        <div className='flex justify-center items-center mb-6 my-0'>
          <Image
            src={question.imageUrl}
            alt='Question image'
            width={400}
            height={300}
            className='rounded-md my-0'
          />
        </div>
      )}

      <RadioGroup
        value={selectedAnswer.toString()}
        onValueChange={(value) => onSelect(parseInt(value))}
        disabled={isAnswered}
        className='space-y-1'
      >
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 p-4 border dark:border-zinc-700 border-zinc-200 rounded-md ${
              isAnswered && index === question.correctAnswer
                ? 'bg-green-100 dark:bg-green-900/20 rounded-md'
                : isAnswered && index === selectedAnswer && !isCorrect
                ? 'bg-red-100 dark:bg-red-900/20 rounded-md'
                : 'bg-card'
            }`}
          >
            <RadioGroupItem
              value={index.toString()}
              id={`option-${index}`}
              disabled={isAnswered}
            />
            <Label
              htmlFor={`option-${index}`}
              className='cursor-pointer flex-1'
            >
              {option}
            </Label>
            {isAnswered && index === question.correctAnswer && (
              <CheckCircle
                className='text-green-500 m-0 flex-shrink-0'
                size={20}
              />
            )}
            {isAnswered && index === selectedAnswer && !isCorrect && (
              <AlertCircle
                className='text-red-500 m-0 flex-shrink-0'
                size={20}
              />
            )}
          </div>
        ))}
      </RadioGroup>

      {isAnswered && (
        <div className='mt-6 p-4 bg-muted rounded-lg'>
          <p className='font-normal mb-2'>
            {isCorrect ? (
              <div className='flex items-center'>
                <CheckCircle
                  className='text-green-500 mt-1 flex-shrink-0'
                  size={20}
                />
                <span className='ml-2'>Correct!</span>
              </div>
            ) : (
              <div className='flex items-center'>
                <AlertCircle className='text-red-500 flex-shrink-0' size={20} />
                <span className='ml-2'>Let&apos;s Review This One!</span>
              </div>
            )}
          </p>
          <div>{renderQuestionText(question.explanation)}</div>
        </div>
      )}
    </div>
  )
}
