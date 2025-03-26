// types/quiz.ts
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // Index of the correct option
  explanation?: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  tutorialId: string
  questions: QuizQuestion[]
}
