import { doc, getDoc, setDoc, increment, collection } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User } from '@/types/firebase'
import { StudentProgress } from '@/types/classrooms/live-session'

export async function handleAssignmentCompletion(
  user: User,
  assignment_id: string,
  code: string,
  success: boolean
) {
  if (!user) return

  try {
    // Reference to the specific assignment document
    const assignmentRef = doc(
      fireStore,
      'users',
      user.uid,
      'assignments',
      assignment_id
    )

    // Reference to the attempts subcollection
    const attemptRef = doc(
      collection(
        fireStore,
        'users',
        user.uid,
        'assignments',
        assignment_id,
        'attempts'
      )
    )

    // Get current assignment data
    const assignmentSnap = await getDoc(assignmentRef)
    const currentData = assignmentSnap.data() as StudentProgress | undefined

    // Create a new attempt record
    await setDoc(attemptRef, {
      code: code,
      timestamp: Date.now(),
      success: success,
    })

    // Prepare the update data according to StudentProgress interface
    const updateData: Partial<StudentProgress> = {
      lastAttempt: Date.now(),
      completed: success || currentData?.completed || false,
      totalAttempts: increment(1),
      // Only increment successful attempts if success is true
      ...(success && { successfulAttempts: increment(1) }),
    }

    // Update the assignment document
    await setDoc(assignmentRef, updateData, { merge: true })
  } catch (error) {
    console.error('Error recording assignment completion:', error)
    throw error
  }
}
