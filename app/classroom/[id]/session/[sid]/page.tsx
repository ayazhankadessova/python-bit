'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { StudentSessionView } from '@/components/session-views/student-session-view'
import { TeacherSessionView } from '@/components/session-views/teacher-session-view'

interface PageProps {
  params: {
    id: string // classroom id
    sid: string // session id
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

const SessionPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [classroom, setClassroom] = useState<ClassroomData | null>(null)
  const { toast } = useToast()

  // Get IDs from URL parameters
  const classroomId = params.id
  const sessionId = params.sid

  // Fetch classroom data and determine user role
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
          toast({
            title: 'Error',
            description: 'Classroom not found',
            variant: 'destructive',
          })
          router.push('/classrooms')
          return
        }

        // Verify user has access to this classroom
        const classroomData = {
          id: classroomSnap.id,
          ...classroomSnap.data(),
        } as ClassroomData

        const hasAccess =
          user.role === 'teacher'
            ? classroomData.teacherId === user.uid
            : classroomData.studentIds.includes(user.uid)

        if (!hasAccess) {
          setError('Unauthorized access')
          toast({
            title: 'Error',
            description: 'You do not have access to this classroom',
            variant: 'destructive',
          })
          router.push('/classrooms')
          return
        }

        setClassroom(classroomData)
      } catch (error) {
        console.error('Error fetching classroom:', error)
        setError('Failed to load classroom data')
        toast({
          title: 'Error',
          description: 'Failed to load classroom data',
          variant: 'destructive',
        })
      }
    }

    fetchClassroomAndRole()
  }, [user, classroomId, router, toast])

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-600'>{error}</div>
      </div>
    )
  }

  // Show loading state while fetching data
  if (!user || !classroom) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  // Main session view
  return user.role === 'teacher' ? (
    <TeacherSessionView
      classroomId={classroomId}
      sessionId={sessionId}
      onEndSession={() => {
        // Handle session end
        router.push(`/classrooms/${classroomId}`)
      }}
    />
  ) : (
    <StudentSessionView classroomId={classroomId} sessionId={sessionId} />
  )
}

export default SessionPage
