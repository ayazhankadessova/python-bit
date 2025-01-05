import useSWR from 'swr'
import { User } from '@/types/firebase'
import { TutorialProgress, UseTutorialProgressOptions } from '@/types/tutorial/tutorial'

/**
 * Custom hook for fetching user progress on tutorials
 */
export function useTutorialProgress(
  tutorialId: string | null,
  exerciseCount: number,
  user: User | null,
  options: UseTutorialProgressOptions = {}
) {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = 600000, // 10 minutes
  } = options

  // Only fetch if we have both tutorialId and user
  const shouldFetch = Boolean(tutorialId && user && exerciseCount > 0)
  const url = shouldFetch
    ? `/api/progress/tutorial?userId=${user?.uid}&tutorialId=${tutorialId}&count=${exerciseCount}`
    : null

  const { data, error, mutate } = useSWR<TutorialProgress>(
    url,
    async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to fetch tutorial progress')
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
    progress: data?.progress,
    completedExercises: data?.completedExercises,
    totalExercises: data?.totalExercises,
    exercises: data?.exercises,
    lastUpdated: Date.now(),
    isLoading: !error && !data,
    error,
    invalidateCache: () => mutate(undefined, true), // Drop the cache and revalidate
  }
}
