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
    const assignmentRef = doc(
      fireStore,
      'users',
      user.uid,
      'assignments',
      assignment_id
    )

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

    const assignmentSnap = await getDoc(assignmentRef)
    const currentData = assignmentSnap.data() as StudentProgress | undefined

    await setDoc(attemptRef, {
      code: code,
      timestamp: Date.now(),
      success: success,
    })

    const updateData: Partial<StudentProgress> = {
      lastAttempt: Date.now(),
      completed: success || currentData?.completed || false,
      totalAttempts: increment(1),
      ...(success && { successfulAttempts: increment(1) }),
    }

    await setDoc(assignmentRef, updateData, { merge: true })
  } catch (error) {
    console.error('Error recording assignment completion:', error)
    throw error
  }
}
