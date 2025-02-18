// hooks/useTutorialProgress.ts
import useSWR, { mutate as globalMutate } from 'swr'
import { User } from '@/types/firebase'
import {
  TutorialProgress,
  UseTutorialProgressOptions,
} from '@/types/tutorial/tutorial'

// Helper to generate consistent cache keys (without exerciseCount)
export const getTutorialProgressKey = (userId: string, tutorialId: string) =>
  `tutorial-progress-${userId}-${tutorialId}`

export function useTutorialProgress(
  tutorialId: string | null,
  exerciseCount: number,
  user: User | null,
  options: UseTutorialProgressOptions = {}
) {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = 5000,
  } = options

  // Only fetch if we have both tutorialId and user
  const shouldFetch = Boolean(tutorialId && user && exerciseCount > 0)
  const cacheKey = shouldFetch
    ? getTutorialProgressKey(user!.uid, tutorialId!)
    : null

  const { data, error, mutate } = useSWR<TutorialProgress>(
    cacheKey,
    async () => {
      // Include exerciseCount in the fetch URL but not in the cache key
      const url = `/api/progress/tutorial?userId=${
        user!.uid
      }&tutorialId=${tutorialId}&count=${exerciseCount}`
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
    progress: data?.progress ?? 0,
    completedExercises: data?.completedExercises,
    totalExercises: data?.totalExercises,
    exercises: data?.exercises,
    lastUpdated: data?.lastUpdated,
    isLoading: !error && !data,
    error,
    invalidateCache: () => mutate(undefined, true),
  }
}

// Helper function to invalidate cache from anywhere (doesn't need exerciseCount)
export function invalidateTutorialProgress(userId: string, tutorialId: string) {
  const cacheKey = getTutorialProgressKey(userId, tutorialId)
  return globalMutate(cacheKey)
}
