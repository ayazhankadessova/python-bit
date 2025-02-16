import {
  doc,
  getDoc,
  setDoc,
  increment,
  collection,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { User } from '@/types/firebase'

export async function handleAssignmentCompletion(
  user: User,
  assignment_id: string,
  code: string,
  success: boolean
) {
  if (!user) return

  try {
    // Reference to the specific project document
    const projectRef = doc(
      fireStore,
      'users',
      user.uid,
      'assignments',
      assignment_id
    )

    // Reference to the attempts subcollection - create a new doc with auto ID
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
