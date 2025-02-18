import useSWR from 'swr'
import { ClassroomTC } from '@/types/firebase'

interface UseTeacherClassroomsReturn {
  classrooms: ClassroomTC[]
  isLoading: boolean
  error: Error | null
  mutate: () => void
}

export function useTeacherClassrooms(
  userId: string
): UseTeacherClassroomsReturn {
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
      revalidateOnFocus: true, // Don't revalidate on window focus
      revalidateIfStale: true,
      keepPreviousData: true, // Keep showing previous data while loading
      dedupingInterval: 10, // Dedupe requests within 5 seconds
    }
  )

  return {
    classrooms: data?.classrooms || [],
    isLoading: isLoading && !data, // Only show loading if we don't have any data
    error: error || null,
    mutate,
  }
}
