'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { Loader2 } from 'lucide-react'
import { User, Teacher, Student } from '@/models/types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/')
        return
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error('Failed to fetch user')
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
        localStorage.removeItem('token')
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
          <p className='text-lg text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return user.role === 'teacher' ? (
    <TeacherDashboard user={user as Teacher} onSignOut={handleSignOut} />
  ) : (
    <StudentDashboard user={user as Student} onSignOut={handleSignOut} />
  )
}
