// hooks/useSessionFiltering.ts
import { useState, useMemo } from 'react'
import type { SessionWithDuration } from '@/types/classrooms/live-session'

export type SortMethod = 'newest' | 'week'

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

// Helper function to convert week numbers to text and vice versa
// 1, week 1, week one, one
const weekNumberVariations = (weekNum: number): string[] => {
  const variations = [
    weekNum.toString(),                   
    `week ${weekNum}`,                  
    `week ${numberToWord(weekNum)}`,       
    numberToWord(weekNum)                 
  ]
  return variations
}

// Helper to convert numbers to words (for common use cases 1-12)
const numberToWord = (num: number): string => {
  const words = [
    'zero', 'one', 'two', 'three', 'four', 
    'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve'
  ]
  return words[num] || num.toString()
}

export function useSessionFiltering(sessions: SessionWithDuration[]) {
  const [searchText, setSearchText] = useState('')
  const [sortMethod, setSortMethod] = useState<SortMethod>('newest')

  const filteredAndSortedSessions = useMemo(() => {
    const filtered = sessions.filter((session) => {
      if (!searchText) return true

      const normalizedSearch = normalizeText(searchText)
      const searchLower = searchText.toLowerCase().trim()

      // Check all possible variations of the week number
      const weekMatches = weekNumberVariations(session.weekNumber).some(
        (variation) => variation.toLowerCase().includes(searchLower)
      )

      // Check task name
      const taskMatch = session.activeTask
        ? normalizeText(session.activeTask).includes(normalizedSearch)
        : false

      return weekMatches || taskMatch
    })

    return filtered.sort((a, b) => {
      switch (sortMethod) {
        case 'newest':
          return b.startedAt - a.startedAt
        case 'week':
          return a.weekNumber - b.weekNumber
        default:
          return 0
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