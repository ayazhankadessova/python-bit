// app/api/progress/tutorial/route.ts
import { NextResponse } from 'next/server'
import { doc, getDoc, DocumentData } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import {
  TutorialProgress,
} from '@/types/tutorial/tutorial'

interface ExerciseProgress {
  completed: boolean
  timestamp: number
}

interface TutorialData extends DocumentData {
  exercises?: Record<number, ExerciseProgress>
}

interface ErrorResponse {
  message: string
}

function calculateProgress(
  exercises: Record<number, ExerciseProgress>,
  totalCount: number
): number {
  const completedCount = Object.values(exercises).filter(
    (exercise: ExerciseProgress) => exercise.completed
  ).length
  return (completedCount / totalCount) * 100
}

function createDefaultResponse(): TutorialProgress {
  return {
    progress: 0,
    completedExercises: 0,
    totalExercises: 0,
    exercises: {},
    lastUpdated: Date.now(),
  }
}

function validateParams(params: URLSearchParams): {
  userId: string
  tutorialId: string
  count: number
} | null {
  const userId = params.get('userId')
  const tutorialId = params.get('tutorialId')
  const countStr = params.get('count')

  if (!userId || !tutorialId || !countStr) {
    return null
  }

  const count = parseInt(countStr, 10)
  if (isNaN(count)) {
    return null
  }

  return { userId, tutorialId, count }
}

export async function GET(
  request: Request
): Promise<NextResponse<TutorialProgress | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = validateParams(searchParams)

    if (!params) {
      return NextResponse.json(
        { message: 'Missing or invalid required parameters' },
        { status: 400 }
      )
    }

    const { userId, tutorialId, count } = params

    const tutorialRef = doc(fireStore, 'users', userId, 'tutorials', tutorialId)
    const docSnap = await getDoc(tutorialRef)

    if (!docSnap.exists()) {
      return NextResponse.json(createDefaultResponse())
    }

    const data = docSnap.data() as TutorialData
    const exercises = data.exercises || {}

    const completedExercises = Object.values(exercises).filter(
      (exercise: ExerciseProgress) => exercise.completed
    ).length

    const response: TutorialProgress = {
      progress: calculateProgress(exercises, count),
      completedExercises,
      totalExercises: count,
      exercises,
      lastUpdated: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching tutorial progress:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Add other HTTP methods if needed
export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}
