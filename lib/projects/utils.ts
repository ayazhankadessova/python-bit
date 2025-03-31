import { Project, ProjectCollection } from '@/types/utils'
import { Projects } from '#site/content'
import { PROJECTS } from '@/config/projects'

/**
 * Get an exercise by its ID
 * @param id - The unique identifier of the exercise
 * @returns The exercise object if found, undefined otherwise
 */
export function getExerciseById(id?: string): Project | undefined {
  if (!id) return undefined
  const directLookup = Object.entries(PROJECTS as ProjectCollection).find(
    ([, project]) => project.id === id
  )
  if (directLookup) {
    return directLookup[1]
  }
  return undefined
}

/**
 * Get all exercises that match given tags
 * @param tags - Array of tags to filter by
 * @returns Array of exercises that contain all specified tags
 */
export function getProjectByTags(
  projects: Array<Projects>, tags: string[]
): Projects[] {
  return projects.filter((project) =>
    tags.every((tag) => project.tags.includes(tag))
  )
}

/**
 * Get all exercises for a specific difficulty level
 * @param difficulty - The difficulty level to filter by
 * @returns Array of exercises matching the difficulty
 */
// export function getProjectsByDifficulty(
//   projects: Array<Projects>,
//   difficulty: Project['difficulty']
// ): Project[] {
//   return projects.filter(
//     (project) => project.difficulty === difficulty
//   )
// }

export function filterProjectsBySearchTerm(
  projects: Array<Projects>,
  searchTerm: string
): Array<Projects> {
  if (!searchTerm) return projects

  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  return projects.filter((projects) => {
    const { title, description, tags } = projects
    const normalizedTitle = title.toLowerCase()
    const normalizedExcerpt = description?.toLowerCase()
    const normalizedTags = tags?.map((tag) => tag.toLowerCase())

    return (
      normalizedTitle.includes(normalizedSearchTerm) ||
      normalizedExcerpt?.includes(normalizedSearchTerm) ||
      normalizedTags?.some((tag) => tag.includes(normalizedSearchTerm))
    )
  })
}
