import { doc, getDoc, updateDoc, arrayUnion, setDoc, increment, collection } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User } from '@/types/firebase'
import { Socket } from 'socket.io-client'

interface ExerciseProgress {
  completed: boolean
  timestamp: number
}

interface TutorialData {
  exercises?: {
    [exerciseNumber: number]: ExerciseProgress
  }
}

// Shared helper function to update weekly progress
export async function updateWeeklyProgress(
  classroomId: string,
  selectedWeek: number,
  taskId: string,
  userId: string
) {
  const weeklyProgressRef = doc(
    fireStore,
    'weeklyProgress',
    `${classroomId}-${selectedWeek}`
  )

  try {
    const weeklyProgressDoc = await getDoc(weeklyProgressRef)

    if (weeklyProgressDoc.exists()) {
      const data = weeklyProgressDoc.data()
      const taskCompletions = data.taskCompletions || {}

      // Initialize the array for this task if it doesn't exist
      if (!taskCompletions[taskId]) {
        taskCompletions[taskId] = []
      }

      // Add the user if they haven't completed it yet
      if (!taskCompletions[taskId].includes(userId)) {
        taskCompletions[taskId].push(userId)
      }

      await updateDoc(weeklyProgressRef, {
        taskCompletions,
        lastUpdated: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Error updating weekly progress:', error)
    throw error
  }
}

// Function to handle task completion for any problem type
export async function handleTaskCompletion({
  taskId,
  userId,
  classroomId,
  selectedWeek,
  socket,
  userName,
  onUpdateCompletedProblems,
}: {
  taskId: string
  userId: string
  classroomId: string
  selectedWeek: number
  socket: Socket | null
  userName?: string
  onUpdateCompletedProblems: (taskId: string) => void
}) {
  try {
    // Update user's solved problems in Firestore
    const userRef = doc(fireStore, 'users', userId)
    await updateDoc(userRef, {
      solvedProblems: arrayUnion(taskId),
    })

    // Update weekly progress
    await updateWeeklyProgress(classroomId, selectedWeek, taskId, userId)

    // Notify teacher through socket
    socket?.emit('task-completed', {
      taskId,
      studentId: userId,
      studentName: userName,
      classroomId,
    })

    // Update local state
    onUpdateCompletedProblems(taskId)

    return true
  } catch (error) {
    console.error('Error handling task completion:', error)
    throw error
  }
}

export async function handleExerciseCompletion(
  user: User,
  tutorialId: string,
  exerciseNumber: number
) {
  if (!user) return

  const progressRef = doc(fireStore, 'users', user.uid, 'tutorials', tutorialId)

  await setDoc(
    progressRef,
    {
      exercises: {
        [exerciseNumber]: {
          completed: true,
          timestamp: Date.now(),
        },
      },
    },
    { merge: true }
  )
}

export async function getTutorialProgress(
  userId: string,
  tutorialId: string,
  count: number
) {
  const tutorialRef = doc(fireStore, 'users', userId, 'tutorials', tutorialId)
  const docSnap = await getDoc(tutorialRef)

  if (!docSnap.exists()) return 0

  const data = docSnap.data() as TutorialData
  console.log('Raw data:', JSON.stringify(data, null, 2))

  // Correctly parse exercises
  const exercises = data.exercises || {}

  const completedExercises = Object.values(exercises).filter(
    (exercise) => exercise?.completed
  ).length

  return (completedExercises / count) * 100
}

export async function handleProjectCompletion(
  user: User,
  project_id: string,
  code: string,
  success: boolean
) {
  if (!user) return

  try {
    // Reference to the specific project document
    const projectRef = doc(fireStore, 'users', user.uid, 'projects', project_id)

    // Reference to the attempts subcollection - create a new doc with auto ID
    const attemptRef = doc(
      collection(
        fireStore,
        'users',
        user.uid,
        'projects',
        project_id,
        'attempts'
      )
    )

    // Create a new attempt record
    await setDoc(attemptRef, {
      code: code,
      timestamp: Date.now(),
      success: success,
    })

    // Update the project document
    await setDoc(
      projectRef,
      {
        lastAttempt: Date.now(),
        completed:
          success || (await getDoc(projectRef)).data()?.completed || false,
        totalAttempts: increment(1),
        successfulAttempts: success ? increment(1) : 0,
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error recording project completion:', error)
    throw error
  }
}

export async function getProjectProgress(userId: string, projectId: string) {
  try {
    const projectRef = doc(fireStore, 'users', userId, 'projects', projectId)
    const projectDoc = await getDoc(projectRef)

    if (!projectDoc.exists()) {
      // Project hasn't been attempted yet
      return {
        completed: false,
        lastAttempt: null,
        totalAttempts: 0,
        successfulAttempts: 0,
      }
    }

    const data = projectDoc.data()
    return {
      completed: data.completed || false,
      lastAttempt: data.lastAttempt || null,
      totalAttempts: data.totalAttempts || 0,
      successfulAttempts: data.successfulAttempts || 0,
    }
  } catch (error) {
    console.error('Error getting project progress:', error)
    throw error
  }
}
