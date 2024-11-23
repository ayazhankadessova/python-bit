'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LoginForm from '@/components/LoginForm'
import SignupForm from '@/components/SignupForm'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [showLoginForm, setShowLoginForm] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

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
