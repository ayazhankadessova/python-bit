'use client'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { SessionManagement } from '@/components/session-views/session-management'

interface PageProps {
  params: {
    id: string
  }
}

const ClassroomLessonPage: React.FC<PageProps> = ({ params }) => {
  const { user, loading } = useAuth() // Firebase Auth context

  const classroomId = params.id

   if (loading) return <LoadingSpinner />

   if (!user) {
     return (
       <div className='flex items-center justify-center min-h-screen'>
         Please Login to View This Page.
       </div>
     )
   }

   return (
     <SessionManagement
       classroomId={classroomId}
       isTeacher={user.role === 'teacher'}
     />
   )
}

export default ClassroomLessonPage
