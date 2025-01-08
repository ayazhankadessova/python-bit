// export default ClassroomPage
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { SessionManagement } from '@/components/session-views/session-management'

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
  const router = useRouter()
  const { user } = useAuth() // Firebase Auth context

  const [error, setError] = useState<string | null>(null)
  const [classroom, setClassroom] = useState<ClassroomData | null>(null)
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null)

  const classroomId = params.id

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

  // Main session view
  if (user && classroom) {
    return (
      <SessionManagement
        classroomId={classroomId}
        teacherId={user.uid}
        isTeacher={userRole === 'teacher'}
      />
    )
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Loader2 className='h-8 w-8 animate-spin' />
    </div>
  )
}

export default ClassroomLessonPage
