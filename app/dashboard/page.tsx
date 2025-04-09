'use client'
import { TeacherDashboard } from '@/components//dashboard/TeacherDashboard'
import { StudentDashboard } from '@/components/dashboard/StudentDashboard'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <ProtectedRoute>
      {user?.role === 'teacher' ? (
        <TeacherDashboard onSignOut={signOut} />
      ) : (
        <StudentDashboard onSignOut={signOut} />
      )}
    </ProtectedRoute>
  )
}
