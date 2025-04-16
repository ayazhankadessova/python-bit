'use client'
import { useAuth } from '@/contexts/AuthContext'
import { TeacherClassroomsView } from '@/components/classrooms/TeacherClassroomsView'
import { StudentClassroomsView } from '@/components/classrooms/StudentClassroomsView'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import CustomLoginRequired from '@/components/auth/login-required'

const ClassroomPage = () => {
  const { user, loading } = useAuth()

  // to do: go home
  // const router = useRouter()

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {!user ? <CustomLoginRequired/> : user.role === 'teacher' ? (
        <TeacherClassroomsView user={user} />
      ) : (
        <StudentClassroomsView user={user} />
      )}
    </div>
  )
}

export default ClassroomPage
