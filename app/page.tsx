'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import LoginForm from '@/components/LoginForm'
import SignupForm from '@/components/SignupForm'
import { useRouter } from 'next/navigation'
import { Teacher } from '@/models/types'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const [showLoginForm, setShowLoginForm] = useState(true)
  const [user, setUser] = useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setIsLoading(false)
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Loading state
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

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-4xl font-bold mb-2'>
              Welcome back, {user.name}!
            </h1>
            <p className='text-gray-600'>Here's your teaching overview</p>
          </div>
          <Button
            variant='outline'
            onClick={() => {
              localStorage.removeItem('token')
              setUser(null)
            }}
          >
            Sign Out
          </Button>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Button
                className='w-full'
                onClick={() => router.push('/classrooms')}
              >
                View My Classrooms
              </Button>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => router.push('/classrooms')}
              >
                Create New Classroom
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest teaching activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <p className='text-sm text-gray-500'>No recent activity</p>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Teaching Stats</CardTitle>
              <CardDescription>Your teaching metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium'>Total Students</p>
                  <p className='text-2xl font-bold'>
                    {user.students?.length || 0}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Active Classrooms</p>
                  <p className='text-2xl font-bold'>
                    {user.classrooms?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If user is not logged in, show auth forms
  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-md mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold mb-4'>Welcome to PythonBit</h1>
            <p className='text-xl text-muted-foreground'>
              Your platform for teaching Python with micro:bit
            </p>
          </div>

          <Card className='mb-6'>
            <CardContent className='pt-6'>
              <div className='flex gap-4 mb-6'>
                <Button
                  variant={showLoginForm ? 'default' : 'outline'}
                  className='flex-1'
                  onClick={() => setShowLoginForm(true)}
                >
                  Login
                </Button>
                <Button
                  variant={!showLoginForm ? 'default' : 'outline'}
                  className='flex-1'
                  onClick={() => setShowLoginForm(false)}
                >
                  Sign Up
                </Button>
              </div>

              {showLoginForm ? <LoginForm /> : <SignupForm />}
            </CardContent>
          </Card>

          <div className='text-center text-sm text-muted-foreground'>
            <p>
              {showLoginForm
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={() => setShowLoginForm(!showLoginForm)}
                className='text-primary hover:underline'
              >
                {showLoginForm ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
