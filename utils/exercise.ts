import {EXERCISES} from '@/config/exercises'

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

export function getExerciseById(id: string): Exercise | undefined {
  return Object.values(EXERCISES).find((exercise) => exercise.id === id)
}

export function getPublishedExercises(): Exercise[] {
  return Object.values(EXERCISES).filter((exercise) => exercise.published)
}

export function getExercisesByDifficulty(
  difficulty: Exercise['difficulty']
): Exercise[] {
  return Object.values(EXERCISES).filter(
    (exercise) => exercise.published && exercise.difficulty === difficulty
  )
}

export function getExercisesByTag(tag: string): Exercise[] {
  return Object.values(EXERCISES).filter(
    (exercise) => exercise.published && exercise.tags.includes(tag)
  )
}
