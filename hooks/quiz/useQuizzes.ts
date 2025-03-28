import useSWR from 'swr'
import { Quiz } from '@/types/quiz/quiz'

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  return res.json()
}

// Hook to fetch all quizzes
export function useQuizzes() {
  const { data, error, isLoading, mutate } = useSWR<Quiz[]>(
    '/api/quizzes',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      keepPreviousData: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      refreshInterval: 30000,
    }
  )

  return {
    quizzes: data || [],
    isLoading: isLoading && !data,
    error: error || null,
    mutate,
  }
}

// Hook to fetch a specific quiz
export function useQuiz(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Quiz>(
    id ? `/api/quizzes?quizId=${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      keepPreviousData: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
    }
  )

  return {
    quiz: data || null,
    isLoading: isLoading && !data,
    error: error || null,
    mutate,
  }
}
