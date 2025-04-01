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
