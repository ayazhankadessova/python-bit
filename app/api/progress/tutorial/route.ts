import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { TutorialProgress, TutorialData } from '@/types/tutorial/tutorial'

const DEFAULT_TUTORIAL_PROGRESS: TutorialProgress = {
  progress: 0,
  completedExercises: 0,
  totalExercises: 0,
  exercises: {},
  lastUpdated: 1704449954,
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const tutorialId = searchParams.get('tutorialId')
    const count = searchParams.get('count')

    if (!userId || !tutorialId || !count) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const tutorialRef = doc(fireStore, 'users', userId, 'tutorials', tutorialId)
    const docSnap = await getDoc(tutorialRef)

    if (!docSnap.exists()) {
      return NextResponse.json(DEFAULT_TUTORIAL_PROGRESS)
    }

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
      lastUpdated: data.lastUpdated ?? Date.now(),
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

export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}
