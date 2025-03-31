import { useState } from 'react'
import {
  doc,
  updateDoc,
  arrayUnion,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useToast } from '@/hooks/use-toast'

export function useJoinClassroom(userId: string, onSuccess: () => void) {
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const joinClassroom = async (classCode: string) => {
    setIsJoining(true)
    try {
      const classroomQuery = query(
        collection(fireStore, 'classrooms'),
        where('classCode', '==', classCode.toUpperCase())
      )

      const classroomSnap = await getDocs(classroomQuery)

      if (classroomSnap.empty) {
        throw new Error('Invalid classroom code')
      }

      const classroom = classroomSnap.docs[0]
      const classroomData = classroom.data()

      if (classroomData.students?.includes(userId)) {
        throw new Error('You are already enrolled in this classroom')
      }

      await updateDoc(doc(fireStore, 'classrooms', classroom.id), {
        students: arrayUnion(userId),
      })

      // Update user's classrooms array
      await updateDoc(doc(fireStore, 'users', userId), {
        classrooms: arrayUnion(classroom.id),
      })

      toast({
        title: 'Success',
        description: 'Successfully joined classroom',
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to join classroom',
        variant: 'destructive',
      })
    } finally {
      setIsJoining(false)
    }
  }

  return { joinClassroom, isJoining }
}
