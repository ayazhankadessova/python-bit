// hooks/useTeacherClassrooms.ts
import useSWR from 'swr'
import { ClassroomTC } from '@/utils/types/firebase'

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
  }>(`/api/classrooms?userId=${userId}`, async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('Failed to fetch classrooms')
    }
    return res.json()
  })

  return {
    classrooms: data?.classrooms || [],
    isLoading,
    error: error || null,
    mutate,
  }
}
