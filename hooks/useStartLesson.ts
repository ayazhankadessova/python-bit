import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export function useStartLesson() {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const startLesson = async (classroomId: string) => {
    setIsStarting(true)
    try {
      const classroomRef = doc(fireStore, 'classrooms', classroomId)
      await updateDoc(classroomRef, {
        activeSession: true,
      })
      // Use replace instead of push to prevent back navigation issues
      router.replace(`/classrooms/${classroomId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start lesson: ' + error,
        variant: 'destructive',
      })
    } finally {
      setIsStarting(false)
    }
  }

  return { startLesson, isStarting }
}
