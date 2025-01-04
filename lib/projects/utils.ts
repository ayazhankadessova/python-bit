import { Project, ProjectCollection } from '@/types/utils'
import { PROJECTS } from '@/config/projects'

/**
 * Get an exercise by its ID
 * @param id - The unique identifier of the exercise
 * @returns The exercise object if found, undefined otherwise
 */
export function getExerciseById(id: string): Project | undefined {
  // First try direct lookup since we know the key structure
  const directLookup = Object.entries(PROJECTS as ProjectCollection).find(
    ([, project]) => project.id === id
  )
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
export function getProjectByTags(tags: string[]): Project[] {
  return Object.values(PROJECTS as ProjectCollection).filter((project) =>
    tags.every((tag) => project.tags.includes(tag))
  )
}

/**
 * Get all exercises for a specific difficulty level
 * @param difficulty - The difficulty level to filter by
 * @returns Array of exercises matching the difficulty
 */
export function getProjectsByDifficulty(difficulty: Project['difficulty']): Project[] {
  return Object.values(PROJECTS as ProjectCollection).filter(
    (project) => project.difficulty === difficulty
  )
}

/**
 * Get all published exercises
 * @returns Array of all published exercises
 */
export function getPublishedExercises(): Project[] {
  return Object.values(PROJECTS as ProjectCollection).filter((project) => project.published)
}