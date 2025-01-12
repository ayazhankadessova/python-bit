import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useToast } from '@/hooks/use-toast'

export function useStartStudentLesson() {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const startLesson = async (classroomId: string) => {
    setIsStarting(true)
    try {
      const classroomDoc = await getDoc(
        doc(fireStore, 'classrooms', classroomId)
      )

      if (!classroomDoc.exists()) {
        throw new Error('Classroom not found')
      }

      router.push(`/classrooms/${classroomId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to start lesson',
        variant: 'destructive',
      })
    } finally {
      setIsStarting(false)
    }
  }

  return { startLesson, isStarting }
}
