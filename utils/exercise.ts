import {EXERCISES} from '@/config/exercises'
import { Exercise } from '@/types/utils'

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
