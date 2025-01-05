// app/api/progress/tutorial/route.ts
import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { TutorialProgress, TutorialData } from '@/types/tutorial/tutorial'

export async function GET(request: Request) {
  try {
    // Get URL parameters using URLSearchParams
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const tutorialId = searchParams.get('tutorialId')
    const count = searchParams.get('count')

    // Validate required parameters
    if (!userId || !tutorialId || !count) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get tutorial progress from Firestore
    const tutorialRef = doc(fireStore, 'users', userId, 'tutorials', tutorialId)
    const docSnap = await getDoc(tutorialRef)

    // If no document exists, return default progress
    if (!docSnap.exists()) {
      return NextResponse.json({
        progress: 0,
        exercises: {},
        lastUpdated: Date.now(),
      })
    }

    // Calculate progress
    const data = docSnap.data() as TutorialData
    const exercises = data.exercises || {}

    const completedExercises = Object.values(exercises).filter(
      (exercise) => exercise?.completed
    ).length

    const progressPercentage = (completedExercises / Number(count)) * 100

    const response: TutorialProgress = {
      progress: progressPercentage,
      completedExercises,
      totalExercises: Number(count),
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
