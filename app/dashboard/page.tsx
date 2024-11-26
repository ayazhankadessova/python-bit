// app/dashboard/page.tsx
'use client'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
          <p className='text-lg text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      {user?.role === 'teacher' ? (
        <TeacherDashboard user={user} onSignOut={signOut} />
      ) : (
        <StudentDashboard user={user} onSignOut={signOut} />
      )}
    </ProtectedRoute>
  )
}
