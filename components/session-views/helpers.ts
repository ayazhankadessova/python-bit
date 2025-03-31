import { doc, getDoc, updateDoc, arrayUnion, setDoc, increment, collection } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User } from '@/types/firebase'
import { Socket } from 'socket.io-client'

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
    const userRef = doc(fireStore, 'users', userId)
    await updateDoc(userRef, {
      solvedProblems: arrayUnion(taskId),
    })

    await updateWeeklyProgress(classroomId, selectedWeek, taskId, userId)

    socket?.emit('task-completed', {
      taskId,
      studentId: userId,
      studentName: userName,
      classroomId,
    })

    onUpdateCompletedProblems(taskId)

    return true
  } catch (error) {
    console.error('Error handling task completion:', error)
    throw error
  }
}

export async function handleProjectCompletion(
  user: User,
  project_id: string,
  code: string,
  success: boolean
) {
  if (!user) return

  try {
    const projectRef = doc(fireStore, 'users', user.uid, 'projects', project_id)

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

    await setDoc(attemptRef, {
      code: code,
      timestamp: Date.now(),
      success: success,
    })

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