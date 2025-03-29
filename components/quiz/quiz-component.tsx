'use client'

import { useState, useEffect } from 'react'
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
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { useTheme } from 'next-themes'

// Import both light and dark themes
// No static imports of theme CSS - we'll apply them dynamically

interface QuizComponentProps {
  quiz: Quiz
}

export default function QuizComponent({ quiz }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(quiz.questions.length).fill(-1)
  )
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    Array(quiz.questions.length).fill(false)
  )
  const [showResults, setShowResults] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Force re-render when theme changes to apply proper syntax highlighting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamically apply theme and syntax highlighting when component mounts or theme changes
  useEffect(() => {
    if (mounted) {
      // Remove any previously loaded Prism themes
      const existingThemeLinks = document.querySelectorAll(
        'link[data-prism-theme]'
      )
      existingThemeLinks.forEach((link) => link.remove())

      // Dynamically load the appropriate theme based on current mode
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.setAttribute('data-prism-theme', 'true')

      if (resolvedTheme === 'dark') {
        link.href =
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
      } else {
        link.href =
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
      }

      document.head.appendChild(link)

      // Apply syntax highlighting
      setTimeout(() => {
        Prism.highlightAll()
      }, 0)
    }
  }, [mounted, theme, resolvedTheme, currentQuestionIndex, showResults])

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const isAnswered = answeredQuestions[currentQuestionIndex]
  const selectedAnswer = selectedAnswers[currentQuestionIndex]
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  const handleAnswerSelection = (answerIndex: number) => {
    if (answeredQuestions[currentQuestionIndex]) return

    const newSelectedAnswers = [...selectedAnswers]
    newSelectedAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newSelectedAnswers)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] === -1) return

    const newAnsweredQuestions = [...answeredQuestions]
    newAnsweredQuestions[currentQuestionIndex] = true
    setAnsweredQuestions(newAnsweredQuestions)
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

  // Check if we're in dark mode
  const isDarkMode = resolvedTheme === 'dark'

  // Function to render question text with code blocks
  const renderQuestionText = (text: string) => {
    if (!text || !text.includes('```python')) {
      return text
    }

    const regex = /```python([\s\S]*?)```/g
    let lastIndex = 0
    const elements = []
    let match
    let key = 0

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={key++}>{text.substring(lastIndex, match.index)}</span>
        )
      }

      const code = match[1].trim()
      const highlightedCode = Prism.highlight(
        code,
        Prism.languages.python,
        'python'
      )

      elements.push(
        <pre
          key={key++}
          className={`p-3 rounded-md my-2 overflow-x-auto ${
            isDarkMode
              ? 'bg-zinc-800 border border-zinc-700'
              : 'bg-zinc-100 border border-zinc-200'
          }`}
        >
          <code
            className='language-python text-sm'
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      )

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      elements.push(<span key={key++}>{text.substring(lastIndex)}</span>)
    }

    return <>{elements}</>
  }

  const allQuestionsAnswered = answeredQuestions.every((item) => item === true)
  const score = calculateScore()

  // Don't render until we have theme information
  if (!mounted) {
    return null
  }

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
                      <h4 className='font-medium'>Question {index + 1}: </h4>
                      <div className='mt-1 mb-3'>
                        {renderQuestionText(question.question)}
                      </div>

                      {/* Display image if available */}
                      {question.imageUrl && (
                        <div className='my-3'>
                          <Image
                            src={question.imageUrl}
                            alt={`Question ${index + 1} image`}
                            width={400}
                            height={300}
                            className='rounded-md'
                          />
                        </div>
                      )}
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
                        <div className='mt-2 text-muted-foreground'>
                          <strong className='block mb-1'>Explanation:</strong>
                          {renderQuestionText(question.explanation)}
                        </div>
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
              setAnsweredQuestions(Array(quiz.questions.length).fill(false))
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
    <div className='min-h-screen flex flex-col'>
      {/* Main Content */}
      <div className='flex-grow'>
        <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8'>
          <div className='prose prose-img:rounded-xl max-w-none mt-2 prose dark:prose-invert'>
            <h1 className='mb-2 text-foreground dark:text-foreground'>
              {quiz.title}
            </h1>
            <p className='text-xl mt-0 text-muted-foreground dark:text-muted-foreground'>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <hr className='my-4' />
            <div className='mb-6 mx-auto xl:px-24 lg:px-16 md:px-8 sm:px-0'>
              <p className='text-lg font-normal mb-6'>
                {renderQuestionText(currentQuestion.question)}
              </p>

              {/* Display image if available */}
              {currentQuestion.imageUrl && (
                <div className='flex justify-center items-center mb-6 my-0'>
                  <Image
                    src={currentQuestion.imageUrl}
                    alt='Question image'
                    width={400}
                    height={300}
                    className='rounded-md my-0'
                  />
                </div>
              )}

              <RadioGroup
                value={selectedAnswers[currentQuestionIndex].toString()}
                onValueChange={(value) =>
                  handleAnswerSelection(parseInt(value))
                }
                disabled={isAnswered}
                className='space-y-1'
              >
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-4 border dark:border-zinc-700 border-zinc-200 rounded-md ${
                      isAnswered && index === currentQuestion.correctAnswer
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
                    {isAnswered && index === currentQuestion.correctAnswer && (
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
                  <p className='font-medium mb-2'>
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
                        <AlertCircle
                          className='text-red-500 flex-shrink-0'
                          size={20}
                        />
                        <span className='ml-2'>
                          Let&apos;s Review This One!
                        </span>
                      </div>
                    )}
                  </p>
                  <div>{renderQuestionText(currentQuestion.explanation)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='sticky bottom-0 bg-background flex items-center justify-between px-6 py-3 border-t border-muted flex-shrink-0'>
        <Button
          variant='outline'
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Previous
        </Button>

        <div className='flex-1 flex justify-center'>
          <span className='px-3 py-1 bg-muted rounded-full text-xs'>
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </span>
        </div>

        {!isAnswered ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswers[currentQuestionIndex] === -1}
          >
            Submit
          </Button>
        ) : isLastQuestion ? (
          <Button
            onClick={handleSubmitQuiz}
            variant='default'
            className={
              allQuestionsAnswered ? 'bg-green-600 hover:bg-green-700' : ''
            }
          >
            Finish Quiz
            {!allQuestionsAnswered &&
              ` (${answeredQuestions.filter((q) => q).length}/${
                quiz.questions.length
              })`}
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            Next
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        )}
      </footer>
    </div>
  )
}
