// ClassroomPage.tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { TeacherClassroomsView } from '@/components/classrooms/TeacherClassroomsView'
import { StudentClassroomsView } from '@/components/classrooms/StudentClassroomsView'
import { Loader2 } from 'lucide-react'

const ClassroomPage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return user?.role === 'teacher' ? (
    <TeacherClassroomsView user={user} />
  ) : (
    <StudentClassroomsView user={user!} />
  )
}

export default ClassroomPage
