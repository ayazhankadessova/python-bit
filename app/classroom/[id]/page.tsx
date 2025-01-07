// export default ClassroomPage
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeacherSessionView } from '@/components/session-views/TeacherSessionView'
import { StudentSessionView } from '@/components/session-views/StudentSessionView'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'

interface PageProps {
  params: {
    id: string
  }
}

interface ClassroomData {
  id: string
  name: string
  lastTaughtWeek: number
  teacherId: string
  isActive?: boolean
  studentIds: string[]
}

const ClassroomLessonPage: React.FC<PageProps> = ({ params }) => {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth() // Firebase Auth context
  const [error, setError] = useState<string | null>(null)
  const [classroom, setClassroom] = useState<ClassroomData | null>(null)
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null)

  const classroomId = params.id

  useEffect(() => {
    const fetchClassroomAndRole = async () => {
      if (!user) {
        setError('Not authenticated')
        router.push('/')
        return
      }

      try {
        const classroomRef = doc(fireStore, 'classrooms', classroomId)
        const classroomSnap = await getDoc(classroomRef)

        if (!classroomSnap.exists()) {
          setError('Classroom not found')
          router.push('/classrooms')
          return
        }

        const classroomData = {
          id: classroomSnap.id,
          ...classroomSnap.data(),
        } as ClassroomData

        setClassroom(classroomData)
        setUserRole(user?.role)
      } catch (error) {
        console.error('Error fetching classroom:', error)
        setError('Failed to load classroom data')
      }
    }

    fetchClassroomAndRole()
  }, [user, classroomId, router])


  // const handleEndSession = async () => {
  //   if (!classroom) return

  //   try {
  //     // Update classroom status in Firebase
  //     if (userRole === 'teacher') {
  //       const classroomRef = doc(fireStore, 'classrooms', classroomId)
  //       await updateDoc(classroomRef, {
  //         isActive: false,
  //       })
  //     }

  //     router.push('/classrooms')
  //   } catch (error) {
  //     console.error('Error ending session:', error)
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to end session properly',
  //       variant: 'destructive',
  //     })
  //   }
  // }

  // Error state
  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Card className='w-96'>
          <CardContent className='pt-6 text-center'>
            <h2 className='text-xl font-semibold mb-4'>Connection Error</h2>
            <p className='text-red-500 mb-6'>{error}</p>
            <div className='space-y-3'>
              {/* <Button
                onClick={handleRetryConnection}
                className='w-full mb-2'
                variant='default'
              >
                <Loader2 className='mr-2 h-4 w-4' />
                Try Again
              </Button> */}
              <Button
                onClick={() => router.push('/classrooms')}
                className='w-full'
                variant='outline'
              >
                Return to Classrooms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main session view
  if (user && classroom ) {

     return user?.role == "teacher" ? (
        <TeacherSessionView classroomId={classroomId} />
      ) : (
        <StudentSessionView classroomId={classroomId} />
      )
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Loader2 className='h-8 w-8 animate-spin' />
    </div>
  )
}

export default ClassroomLessonPage
