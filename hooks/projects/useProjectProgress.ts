import useSWR from 'swr'
import { User } from '@/types/firebase'

export interface Progress {
  completed: boolean
  totalAttempts: number
  successfulAttempts: number
  lastAttempt: number
}

interface useProjectProgressOptions {
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  dedupingInterval?: number
}

/**
 * Custom hook for fetching user progress on projects/tasks
 */
export function useProjectProgress(
  projectId: string | null,
  user: User | null,
  options: useProjectProgressOptions = {}
) {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = 600000, // 10 minutes
  } = options

  // Only fetch if we have both entityId and user
  const shouldFetch = Boolean(projectId && user)
  const url = shouldFetch
    ? `/api/progress/project?userId=${user?.uid}&projectId=${projectId}`
    : null

  const { data, error, mutate } = useSWR<Progress>(
    url,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch progress')
      }
      return res.json()
    },
    {
      revalidateOnFocus,
      revalidateOnReconnect,
      dedupingInterval,
    }
  )

  return {
    progress: data,
    isLoading: !error && !data,
    error,
    invalidateCache: () => mutate(undefined, true), // Drop the cache and revalidate
  }
}
