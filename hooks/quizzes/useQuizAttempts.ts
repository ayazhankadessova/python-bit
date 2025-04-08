import useSWR from 'swr'
import { User } from '@/types/firebase'
import { QuizAttempt } from '@/types/quiz/quiz'

export interface UseQuizAttemptsOptions {
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  dedupingInterval?: number
  limit?: number
}

/**
 * Custom hook for fetching quiz attempts history
 */
export function useQuizAttempts(
  quizId: string | null,
  user: User | null,
  options: UseQuizAttemptsOptions = {}
) {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = 600000, // 10 minutes
    limit = 10,
  } = options

  // Only fetch if we have both quizId and user
  const shouldFetch = Boolean(quizId && user)

  // Create the path-based URL with a limit parameter
  const url = shouldFetch
    ? `/api/progress/quiz/${user?.uid}/${quizId}/attempts?limit=${limit}`
    : null

  const { data, error, mutate } = useSWR<QuizAttempt[]>(
    url,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch quiz attempts')
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
    attempts: data || [],
    isLoading: !error && !data,
    error,
    invalidateCache: () => mutate(undefined, true), // Drop the cache and revalidate
  }
}
