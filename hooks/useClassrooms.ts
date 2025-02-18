import useSWR from 'swr'
import { ClassroomTC } from '@/types/firebase'

interface useClassroomsReturn {
  classrooms: ClassroomTC[]
  isLoading: boolean
  error: Error | null
  mutate: () => void
}

export function useClassrooms(
  userId: string
): useClassroomsReturn {
  const { data, error, isLoading, mutate } = useSWR<{
    classrooms: ClassroomTC[]
  }>(
    `/api/classrooms?userId=${userId}`,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch classrooms')
      }
      return res.json()
    },
    {
      revalidateOnFocus: false, // Don't revalidate on focus
      revalidateIfStale: true, // Still revalidate stale data
      keepPreviousData: true, // Keep old data while loading
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3, // Only retry 3 times
      refreshInterval: 30000,
    }
  )

  return {
    classrooms: data?.classrooms || [],
    isLoading: isLoading && !data, // Only show loading if we don't have any data
    error: error || null,
    mutate,
  }
}
