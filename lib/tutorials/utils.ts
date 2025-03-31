import { Tutorial } from '#site/content'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User } from '@/types/firebase'
import {TutorialData, Exercise} from "@/types/tutorial/tutorial"

export function sortTutorials(tutorials: Array<Tutorial>) {
  return tutorials.sort((a, b) => a.order - b.order)
}

export function sortTutorialsByTime(tutorials: Array<Tutorial>): Array<Tutorial> {
  return tutorials.sort((a, b) => b.date - a.date)
}

export function filterTutorialsBySearchTerm(
  tutorials: Array<Tutorial>,
  searchTerm: string
): Array<Tutorial> {
  if (!searchTerm) return tutorials

  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  return tutorials.filter((post) => {
    const { title, description, tags } = post
    const normalizedTitle = title.toLowerCase()
    const normalizedExcerpt = description?.toLowerCase()
    const normalizedTags = tags?.map((tag) => tag.toLowerCase())

    return (
      normalizedTitle.includes(normalizedSearchTerm) ||
      normalizedExcerpt?.includes(normalizedSearchTerm) ||
      normalizedTags?.some((tag) => tag.includes(normalizedSearchTerm))
    )
  })
}

const createDefaultExercise = (timestamp: number): Exercise => ({
  completed: false,
  lastUpdated: timestamp,
  attempts: [],
})

export async function handleExerciseSubmission(
  user: User,
  tutorialId: string,
  exerciseNumber: number,
  success: boolean,
  code: string
) {
  if (!user) return

  const progressRef = doc(fireStore, 'users', user.uid, 'tutorials', tutorialId)
  const now = Date.now()

  const docSnap = await getDoc(progressRef)
  const currentData: TutorialData = {
    exercises: {},
    lastUpdated: now,
    ...(docSnap.exists() ? (docSnap.data() as TutorialData) : {}),
  }

  if (!currentData.exercises) {
    currentData.exercises = {}
  }

  const currentExercise =
    currentData.exercises[exerciseNumber] ?? createDefaultExercise(now)

  const currentAttempts = currentExercise.attempts || []

  const exerciseUpdate: Exercise = {
    completed: success || currentExercise.completed || false, 
    lastUpdated: now,
    attempts: [
      ...currentAttempts,
      {
        timestamp: now,
        success,
        code,
      },
    ],
  }

  const updateData = {
    exercises: {
      [exerciseNumber]: exerciseUpdate,
    },
    lastUpdated: now,
  }

  await setDoc(progressRef, updateData, { merge: true })

  return {
    success,
    timestamp: now,
    attemptsCount: exerciseUpdate.attempts.length,
    lastAttemptCode: code,
  }
}

export async function handleExerciseRun(user: User, tutorialId: string) {
  if (!user) return null
  if (!tutorialId) return null

  try {
    const progressRef = doc(
      fireStore,
      'users',
      user.uid,
      'tutorials',
      tutorialId
    )
    const now = Date.now()

    const docSnap = await getDoc(progressRef)

    const currentData: TutorialData = {
      exercises: {},
      lastUpdated: now,
      ...(docSnap.exists() ? (docSnap.data() as TutorialData) : {}),
    }

    const updateData = {
      lastUpdated: now,
      ...(currentData.exercises
        ? { exercises: currentData.exercises }
        : { exercises: {} }),
    }

    // Update the document
    await setDoc(progressRef, updateData, { merge: true })

    return {
      timestamp: now,
      lastUpdated: now,
      success: true,
    }
  } catch (error) {
    console.error('Error in handleExerciseRun:', error)
    return {
      timestamp: Date.now(),
      lastUpdated: Date.now(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function getLatestExerciseCode(
  user: User,
  tutorialId: string,
  exerciseNumber: number
): Promise<string | null> {
  if (!user) return null

  const progressRef = doc(fireStore, 'users', user.uid, 'tutorials', tutorialId)
  const docSnap = await getDoc(progressRef)

  if (!docSnap.exists()) return null

  const data = docSnap.data() as TutorialData
  const exercise = data.exercises[exerciseNumber]

  if (!exercise?.attempts?.length) return null

  return exercise.attempts[exercise.attempts.length - 1].code
}
