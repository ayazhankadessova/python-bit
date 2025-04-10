import useSWR from 'swr'
import { User } from '@/types/firebase'
import { QuizProgress } from '@/types/quiz/quiz'

export interface UseQuizProgressOptions {
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  dedupingInterval?: number
}

/**
 * Custom hook for fetching user progress on quizzes
 */
export function useQuizProgress(
  quizId: string | null,
  user: User | null,
  options: UseQuizProgressOptions = {}
) {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = 300000, // 5 minutes
  } = options

  // Only fetch if we have both quizId and user
  const shouldFetch = Boolean(quizId && user)

  // Create the path-based URL
  const url = shouldFetch ? `/api/progress/quiz/${user?.uid}` : null

  const { data, error, mutate } = useSWR<QuizProgress>(
    url,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch quiz progress')
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
