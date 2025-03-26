// components/Quiz/QuizComponent.tsx
'use client'

import { useState } from 'react'
import { Quiz } from '@/types/quiz/quiz'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface QuizComponentProps {
  quiz: Quiz
}

export default function QuizComponent({ quiz }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(quiz.questions.length).fill(-1)
  )
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const isAnswered = selectedAnswers[currentQuestionIndex] !== -1

  const handleAnswerSelection = (answerIndex: number) => {
    if (isSubmitted) return

    const newSelectedAnswers = [...selectedAnswers]
    newSelectedAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newSelectedAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = () => {
    setIsSubmitted(true)
    setShowResults(true)
  }

  const calculateScore = () => {
    let correctAnswers = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++
      }
    })
    return {
      correctAnswers,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((correctAnswers / quiz.questions.length) * 100),
    }
  }

  const score = calculateScore()

  if (showResults) {
    return (
      <Card className='w-full max-w-3xl mx-auto'>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>{quiz.title}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-center p-4'>
            <h3 className='text-2xl font-bold'>
              Your Score: {score.percentage}%
            </h3>
            <p className='text-lg'>
              You got {score.correctAnswers} out of {score.totalQuestions}{' '}
              questions correct!
            </p>
          </div>

          <div className='space-y-6 mt-6'>
            {quiz.questions.map((question, index) => {
              const isCorrect =
                selectedAnswers[index] === question.correctAnswer

              return (
                <div key={question.id} className='border rounded-lg p-4'>
                  <div className='flex items-start gap-2'>
                    {isCorrect ? (
                      <CheckCircle className='text-green-500 mt-1 flex-shrink-0' />
                    ) : (
                      <AlertCircle className='text-red-500 mt-1 flex-shrink-0' />
                    )}
                    <div>
                      <h4 className='font-medium'>
                        Question {index + 1}: {question.question}
                      </h4>
                      <div className='mt-2'>
                        <p className='font-medium'>
                          Your answer:{' '}
                          {question.options[selectedAnswers[index]]}
                        </p>
                        {!isCorrect && (
                          <p className='text-green-700 dark:text-green-400'>
                            Correct answer:{' '}
                            {question.options[question.correctAnswer]}
                          </p>
                        )}
                      </div>
                      {question.explanation && (
                        <p className='mt-2 text-muted-foreground'>
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setIsSubmitted(false)
              setShowResults(false)
              setCurrentQuestionIndex(0)
              setSelectedAnswers(Array(quiz.questions.length).fill(-1))
            }}
            className='w-full'
          >
            Restart Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-4'>
            {currentQuestion.question}
          </h3>
          <RadioGroup
            value={selectedAnswers[currentQuestionIndex].toString()}
            onValueChange={(value) => handleAnswerSelection(parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className='flex items-center space-x-2 py-2'>
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                />
                <Label htmlFor={`option-${index}`} className='cursor-pointer'>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          variant='outline'
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <div className='flex-1 flex justify-center'>
          <span className='px-3 py-1 bg-muted rounded-full text-xs'>
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </span>
        </div>
        {isLastQuestion ? (
          <Button onClick={handleSubmitQuiz} disabled={!isAnswered}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} disabled={!isAnswered}>
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
