// import {EXERCISES} from '@/config/exercises'
// import { Exercise } from '@/types/utils'

// export type ExerciseCollection = {
//   [key: string]: Exercise
// }

// export function getExerciseById(id: string): Exercise | undefined {
//   return Object.values(EXERCISES).find((exercise) => exercise.id === id)
// }

// export function getPublishedExercises(): Exercise[] {
//   return Object.values(EXERCISES).filter((exercise) => exercise.published)
// }

// export function getExercisesByDifficulty(
//   difficulty: Exercise['difficulty']
// ): Exercise[] {
//   return Object.values(EXERCISES).filter(
//     (exercise) => exercise.published && exercise.difficulty === difficulty
//   )
// }

// export function getExercisesByTag(tag: string): Exercise[] {
//   return Object.values(EXERCISES).filter(
//     (exercise) => exercise.published && exercise.tags.includes(tag)
//   )
// }
import { Exercise, ExerciseCollection } from '@/types/utils'
import { EXERCISES } from '@/config/exercises'

/**
 * Get an exercise by its ID
 * @param id - The unique identifier of the exercise
 * @returns The exercise object if found, undefined otherwise
 */
export function getExerciseById(id: string): Exercise | undefined {
  // First try direct lookup since we know the key structure
  const directLookup = Object.entries(EXERCISES).find(([_, exercise]) => exercise.id === id);
  if (directLookup) {
    return directLookup[1];
  }
  return undefined;
}

/**
 * Get all exercises that match given tags
 * @param tags - Array of tags to filter by
 * @returns Array of exercises that contain all specified tags
 */
export function getExercisesByTags(tags: string[]): Exercise[] {
  return Object.values(EXERCISES).filter((exercise) =>
    tags.every((tag) => exercise.tags.includes(tag))
  );
}

/**
 * Get all exercises for a specific difficulty level
 * @param difficulty - The difficulty level to filter by
 * @returns Array of exercises matching the difficulty
 */
export function getExercisesByDifficulty(
  difficulty: Exercise['difficulty']
): Exercise[] {
  return Object.values(EXERCISES).filter(
    (exercise) => exercise.difficulty === difficulty
  );
}

/**
 * Get all published exercises
 * @returns Array of all published exercises
 */
export function getPublishedExercises(): Exercise[] {
  return Object.values(EXERCISES).filter((exercise) => exercise.published);
}