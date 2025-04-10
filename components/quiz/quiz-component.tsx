'use client'

import { useState, useEffect } from 'react'
import { Quiz } from '@/types/quiz/quiz'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { useQuizProgress } from '@/hooks/quizzes/useQuizProgress'
import QuizResults from './QuizResults'
import ActiveQuiz from './ActiveQuiz'
import { renderQuestionText } from './helpers'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface QuizComponentProps {
  quiz: Quiz
}

export default function QuizComponent({ quiz }: QuizComponentProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(quiz.questions.length).fill(-1)
  )
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    Array(quiz.questions.length).fill(false)
  )
  const [showResults, setShowResults] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const [mounted, setMounted] = useState(false)

  const { theme } = useTheme()
  const { user } = useAuth()
  const { progress, invalidateCache, isLoading } = useQuizProgress(
    quiz.id,
    user
  )

  useEffect(() => {
    if (progress && progress.attempts > 0) {
      // If user has taken the quiz before, use their latest answers
      setSelectedAnswers(
        progress.selectedAnswers || Array(quiz.questions.length).fill(-1)
      )
      setShowResults(true)
    }
  }, [progress, quiz.questions.length])

  if (isLoading) {
    return <LoadingSpinner/>
  }

  const handleRetakeQuiz = () => {
    setAnsweredQuestions(Array(quiz.questions.length).fill(false))
    setShowResults(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswers(Array(quiz.questions.length).fill(-1))
  }

  if (showResults) {
    const scoreData = {
      correctAnswers: progress?.correctAnswers || 0,
      totalQuestions: progress?.totalQuestions || quiz.questions.length,
      percentage: progress?.score || 0,
    }

    const displayAnswers =
      progress && progress.selectedAnswers
        ? progress.selectedAnswers
        : selectedAnswers

    return (
      <QuizResults
        quiz={quiz}
        score={scoreData}
        selectedAnswers={displayAnswers}
        progress={progress || null}
        theme={theme}
        onRetakeQuiz={handleRetakeQuiz}
        renderQuestionText={renderQuestionText}
      />
    )
  }

  return (
    <ActiveQuiz
      quiz={quiz}
      currentQuestionIndex={currentQuestionIndex}
      setCurrentQuestionIndex={setCurrentQuestionIndex}
      selectedAnswers={selectedAnswers}
      setSelectedAnswers={setSelectedAnswers}
      answeredQuestions={answeredQuestions}
      setAnsweredQuestions={setAnsweredQuestions}
      setShowResults={setShowResults}
      isSubmitting={isSubmitting}
      setIsSubmitting={setIsSubmitting}
      user={user}
      invalidateCache={invalidateCache}
      theme={theme}
    />
  )
}
