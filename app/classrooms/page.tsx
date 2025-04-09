'use client'
import { useAuth } from '@/contexts/AuthContext'
import { TeacherClassroomsView } from '@/components/classrooms/TeacherClassroomsView'
import { StudentClassroomsView } from '@/components/classrooms/StudentClassroomsView'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const ClassroomPage = () => {
  const { user, loading } = useAuth()

  // to do: go home
  // const router = useRouter()

  if (loading) return <LoadingSpinner />

  return (
    <>
      {!user ? <div>Please Login to View This Page.</div> : user.role === 'teacher' ? (
        <TeacherClassroomsView user={user} />
      ) : (
        <StudentClassroomsView user={user} />
      )}
    </>
  )
}

export default ClassroomPage
