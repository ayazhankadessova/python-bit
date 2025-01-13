// hooks/useSessionFiltering.ts
import { useState, useMemo } from 'react'
import type { SessionWithDuration } from '@/types/classrooms/live-session'

type SortMethod = 'newest' | 'week'

interface UseSessionFilteringReturn {
  searchText: string
  setSearchText: (text: string) => void
  sortMethod: SortMethod
  setSortMethod: (method: SortMethod) => void
  filteredAndSortedSessions: SessionWithDuration[]
}

export function useSessionFiltering(
  sessions: SessionWithDuration[]
): UseSessionFilteringReturn {
  const [searchText, setSearchText] = useState('')
  const [sortMethod, setSortMethod] = useState<SortMethod>('newest')

  // Use useMemo to avoid recalculating on every render
  const filteredAndSortedSessions = useMemo(() => {
    // First filter
    const filteredSessions = sessions.filter((session) => {
      if (searchText === '') return true

      const searchLower = searchText.toLowerCase()
      const weekMatch = session.weekNumber.toString().includes(searchLower)
      const taskMatch = session.activeTask?.toLowerCase().includes(searchLower)

      return weekMatch || taskMatch
    })

    // Then sort
    return [...filteredSessions].sort((a, b) => {
      if (sortMethod === 'newest') {
        return b.startedAt - a.startedAt
      } else {
        return a.weekNumber - b.weekNumber
      }
    })
  }, [sessions, searchText, sortMethod])

  return {
    searchText,
    setSearchText,
    sortMethod,
    setSortMethod,
    filteredAndSortedSessions,
  }
}
