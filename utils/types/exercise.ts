export interface Exercise {
  id: string
  title: string
  description: string
  date: number
  theme?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
  image?: string
  published: boolean
  starterCode: string
  testCode: string
  solution?: string
}

export type ExerciseCollection = {
  [key: string]: Exercise
}
