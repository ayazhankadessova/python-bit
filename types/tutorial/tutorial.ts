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

export interface ExerciseAttempt {
  timestamp: number
  success: boolean
  code: string
}

export interface Exercise {
  completed: boolean
  lastUpdated: number
  attempts: ExerciseAttempt[]
}

export interface TutorialData {
  exercises: Record<number, Exercise>
  lastUpdated: number
}