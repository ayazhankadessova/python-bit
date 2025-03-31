'use client'

import { CircularProgress } from '@/components/ui/circular-progress-bar'
import { useState, useEffect } from 'react'
import { Quiz } from '@/types/quiz/quiz'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { useTheme } from 'next-themes'
import Link from 'next/link'

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const existingThemeLinks = document.querySelectorAll(
        'link[data-prism-theme]'
      )
      existingThemeLinks.forEach((link) => link.remove())

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

  const isDarkMode = resolvedTheme === 'dark'

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
  const isDarkTheme = theme === 'dark'

  if (!mounted) {
    return null
  }

  if (showResults) {
    const passingScore = 70 
    const incorrectAnswers = score.totalQuestions - score.correctAnswers
    return (
      <div className='w-full mx-auto -mt-8'>
        <div className='justify-center items-center flex flex-col bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 dark:from-purple-900 dark:via-purple-950 dark:to-purple-900 py-16 px-4 rounded-lg shadow-md'>
          <h1 className='text-2xl mb-2 text-foreground dark:text-foreground font-bold'>
            Quiz Summary
          </h1>
          <h1 className='text-5xl mb-6 text-foreground dark:text-foreground font-bold'>
            {quiz.title}
          </h1>

          {/* Circular Progress Bar and Details */}
          <div className='flex flex-col md:flex-row items-center justify-center md:space-x-8 w-full max-w-xl'>
            {/* Circular Progress Bar */}
            <div className='mb-6 md:mb-0'>
              <CircularProgress
                percentage={score.percentage}
                size={200}
                strokeWidth={12}
                primaryColor={
                  isDarkTheme ? 'stroke-teal-400' : 'stroke-teal-500'
                }
                secondaryColor={
                  isDarkTheme ? 'stroke-gray-700' : 'stroke-gray-50'
                }
                textSize='text-4xl'
                textClassName={isDarkTheme ? 'text-white' : 'text-black'}
              />
            </div>

            {/* Score Details */}
            <div className='text-center md:text-left'>
              <p className='text-lg font-medium text-foreground mb-5'>
                {score.percentage >= passingScore
                  ? 'Congratulations! You passed!'
                  : `Get ${passingScore}% to pass`}
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

              <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                <Button variant='outline' className='font-semibold text-md p-5'>
                  <Link href={`/tutorials/${quiz.tutorialId}`}>View Tutorial</Link>
                </Button>
                <Button
                  className='text-md font-semibold border border-2 border-purple-500 dark:border-purple-700 p-5'
                  onClick={() => {
                    setAnsweredQuestions(
                      Array(quiz.questions.length).fill(false)
                    )
                    setShowResults(false)
                    setCurrentQuestionIndex(0)
                    setSelectedAnswers(Array(quiz.questions.length).fill(-1))
                  }}
                >
                  Retake Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='xl:px-48 lg:px-32 md:px-16 sm:px-8'>
          <div className='mt-12'>
            {quiz.questions.map((question, index) => {
              const isCorrect =
                selectedAnswers[index] === question.correctAnswer

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
                        <span className='font-medium text-md'>
                          Question {index + 1}
                        </span>
                      </div>
                      <div className='border-t border-gray-300 dark:border-gray-600 flex-grow'></div>
                    </div>
                  </div>

                  {/* Question text */}
                  <div className='mb-4'>
                    <div className='text-xl font-semibold'>
                      {renderQuestionText(question.question)}
                    </div>
                  </div>

                  {/* Display image if available */}
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

                  {/* Answer Card */}
                  <div className='bg-card border rounded-lg p-4 mb-3'>
                    <p className='font-medium'>
                      Your answer: {question.options[selectedAnswers[index]]}
                    </p>
                    {!isCorrect && (
                      <p className='text-green-700 dark:text-green-400 mt-2'>
                        Correct answer:{' '}
                        {question.options[question.correctAnswer]}
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
      </div>
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
