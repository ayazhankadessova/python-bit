'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { StudentSessionView } from '@/components/session-views/student-session-view'
import { TeacherSessionView } from '@/components/session-views/teacher-session-view'

interface PageProps {
  params: {
    id: string // classroom id
    sid: string // session id
  }
}

const SessionPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter()
  const { user } = useAuth()
  // const [error, setError] = useState<string | null>(null)

  // Get IDs from URL parameters
  const classroomId = params.id
  const sessionId = params.sid

  // if (error) {
  //   return (
  //     <div className='flex items-center justify-center min-h-screen'>
  //       <div className='text-red-600'>{error}</div>
  //     </div>
  //   )
  // }

  // Show loading state while fetching data
  if (!user) {
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
        router.push(`/classroom/${classroomId}`)
      }}
    />
  ) : (
    <StudentSessionView
      classroomId={classroomId}
      sessionId={sessionId}
      onEndSession={() => router.push(`/classroom/${classroomId}`)}
    />
  )
}

export default SessionPage
