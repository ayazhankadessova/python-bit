import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

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
  socket: any
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
