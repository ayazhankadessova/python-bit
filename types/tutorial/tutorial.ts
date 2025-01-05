export interface TutorialProgress {
  progress: number
  completedExercises: number
  totalExercises: number
  lastUpdated: number
  exercises: {
    [key: string]: {
      completed: boolean
      lastAttempt?: number
    }
  }
}

export interface UseTutorialProgressOptions {
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  dedupingInterval?: number
}
