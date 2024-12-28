import { Post } from '#site/content'

export function formatDate(input: number): string {
  const date = new Date(input * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function sortPosts(posts: Array<Post>) {
  return posts.sort((a, b) => a.order - b.order)
}

export function sortPostsByTime(posts: Array<Post>): Array<Post> {
  return posts.sort((a, b) => b.date - a.date)
}

export function filterPostsBySearchTerm(
  posts: Array<Post>,
  searchTerm: string
): Array<Post> {
  if (!searchTerm) return posts

  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  return posts.filter((post) => {
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