export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  imageUrl?: string 
}

export interface Quiz {
  id: string
  title: string
  description: string
  tutorialId: string
  imageUrl: string
  questions: Question[]
}

export interface QuizProgress {
  passed: boolean
  lastTaken: number | null
  attempts: number
  successfulAttempts: number
  highestScore: number
  score: number
  correctAnswers: number
  totalQuestions: number
  selectedAnswers: number[]
}

export interface QuizAttempt {
  id: string
  timestamp: number
  score: number
  correctAnswers: number
  totalQuestions: number
  passed: boolean
  selectedAnswers: number[]
}