'use client'

import { useState, useEffect } from 'react'
import { Quiz } from '@/types/quiz/quiz'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { useTheme } from 'next-themes'
import { User } from '@/types/firebase'
import { recordQuizAttempt } from './helper'
import QuizQuestion from './QuizQuestion'
import QuizFooter from './QuizFooter'
import { renderQuestionText } from './helpers'

interface ActiveQuizProps {
  quiz: Quiz
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
  selectedAnswers: number[]
  setSelectedAnswers: (answers: number[]) => void
  answeredQuestions: boolean[]
  setAnsweredQuestions: (answered: boolean[]) => void
  setShowResults: (show: boolean) => void
  isSubmitting: boolean
  setIsSubmitting: (isSubmitting: boolean) => void
  user: User | null
  invalidateCache: () => void
  theme: string | undefined
}

export default function ActiveQuiz({
  quiz,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  selectedAnswers,
  setSelectedAnswers,
  answeredQuestions,
  setAnsweredQuestions,
  setShowResults,
  isSubmitting,
  setIsSubmitting,
  user,
  invalidateCache,
  theme,
}: ActiveQuizProps) {
  const { resolvedTheme } = useTheme()
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
  }, [mounted, theme, resolvedTheme, currentQuestionIndex])

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

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    const score = calculateScore()

    if (user) {
      const success = await recordQuizAttempt(
        user,
        quiz.id,
        quiz.title,
        quiz.tutorialId,
        score.percentage,
        score.correctAnswers,
        score.totalQuestions,
        selectedAnswers
      )

      if (success) {
        invalidateCache()
      }
    }

    setShowResults(true)
    setIsSubmitting(false)
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

  const allQuestionsAnswered = answeredQuestions.every((item) => item === true)

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-grow'>
        <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8'>
          <div className='prose prose-img:rounded-xl max-w-none mt-2 prose dark:prose-invert'>
            <h1 className='mb-2 text-foreground dark:text-foreground'>
              {quiz.title}
            </h1>
            <p className='text-xl mt-0 text-muted-foreground dark:text-muted-foreground'>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <hr className='my-4' />
            <QuizQuestion
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
              onSelect={handleAnswerSelection}
              renderQuestionText={renderQuestionText}
            />
          </div>
        </div>
      </div>

      <QuizFooter
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={quiz.questions.length}
        isAnswered={isAnswered}
        isLastQuestion={isLastQuestion}
        selectedAnswer={selectedAnswer}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onSubmitAnswer={handleSubmitAnswer}
        onFinishQuiz={handleSubmitQuiz}
      />
    </div>
  )
}
