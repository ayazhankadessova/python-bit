'use client'

import { useState, useEffect } from 'react'
import { Quiz } from '@/types/quiz/quiz'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { useQuizProgress } from '@/hooks/quizzes/useQuizProgress'
import { recordQuizAttempt } from './helper'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'
import QuizFooter from './QuizFooter'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const { progress, invalidateCache } = useQuizProgress(quiz.id, user)

  useEffect(() => {
    if (progress && progress.attempts > 0) {
      // If user has taken the quiz before, use their latest answers
      setSelectedAnswers(
        progress.selectedAnswers || Array(quiz.questions.length).fill(-1)
      )
      setShowResults(true)
    }
  }, [progress, quiz.questions.length])

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

  const handleSubmitQuiz = async () => {
    if (!user || isSubmitting) return

    setIsSubmitting(true)
    const score = calculateScore()

    // Record the quiz attempt to Firestore via API
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
      // Refresh the quiz progress data
      invalidateCache()
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

  if (!mounted) {
    return null
  }

  if (showResults) {
    // Use progress data if available for the results display
    const scoreData = progress
      ? {
          correctAnswers: progress.correctAnswers || 0,
          totalQuestions: progress.totalQuestions || quiz.questions.length,
          percentage: progress.score || 0,
        }
      : calculateScore()

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
        onRetakeQuiz={() => {
          setAnsweredQuestions(Array(quiz.questions.length).fill(false))
          setShowResults(false)
          setCurrentQuestionIndex(0)
          setSelectedAnswers(Array(quiz.questions.length).fill(-1))
        }}
        renderQuestionText={renderQuestionText}
      />
    )
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Main Content */}
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

      {/* Footer */}
      <QuizFooter
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={quiz.questions.length}
        isAnswered={isAnswered}
        isLastQuestion={isLastQuestion}
        selectedAnswer={selectedAnswer}
        allQuestionsAnswered={allQuestionsAnswered}
        answeredQuestionsCount={answeredQuestions.filter((q) => q).length}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onSubmitAnswer={handleSubmitAnswer}
        onFinishQuiz={handleSubmitQuiz}
      />
    </div>
  )
}

// Helper function to render question text with code highlighting
function renderQuestionText(text: string) {
  if (!text || !text.includes('```python')) {
    return text
  }

  const regex = /```python([\s\S]*?)```/g
  let lastIndex = 0
  const elements = []
  let match
  let key = 0
  const isDarkMode = document.documentElement.classList.contains('dark')

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
