export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  imageUrl?: string // Optional image URL for the question
}

export interface Quiz {
  id: string
  title: string
  description: string
  tutorialId: string
  questions: Question[]
}
