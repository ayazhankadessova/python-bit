import { Tutorial } from '#site/content'

export function sortTutorials(tutorials: Array<Tutorial>) {
  return tutorials.sort((a, b) => a.order - b.order)
}

export function sortTutorialsByTime(tutorials: Array<Tutorial>): Array<Tutorial> {
  return tutorials.sort((a, b) => b.date - a.date)
}

export function filterTutorialsBySearchTerm(
  tutorials: Array<Tutorial>,
  searchTerm: string
): Array<Tutorial> {
  if (!searchTerm) return tutorials

  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  return tutorials.filter((post) => {
    const { title, description, tags } = post
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
