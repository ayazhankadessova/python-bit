// export default ClassroomPage
'use client'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { SessionManagement } from '@/components/session-views/session-management'

interface PageProps {
  params: {
    id: string
  }
}

const ClassroomLessonPage: React.FC<PageProps> = ({ params }) => {
  const { user } = useAuth() // Firebase Auth context

  const classroomId = params.id

  // Main session view
  if (user) {
    return (
      <SessionManagement
        classroomId={classroomId}
        isTeacher={user.role === 'teacher'}
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
