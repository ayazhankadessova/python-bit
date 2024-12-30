"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, PlayCircle, BookOpen, Users2 } from 'lucide-react'
// import AuthModal from '@/components/AuthModal'
import { useAuthModal } from '@/contexts/AuthModalContext'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { onOpen } = useAuthModal()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='container mx-auto px-4 py-12 md:py-24'>
        <div className='flex flex-col items-center text-center max-w-3xl mx-auto space-y-6'>
          <h1 className='text-4xl md:text-6xl font-bold tracking-tight'>
            PythonBit
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            Learn Python through guided tutorials and real-time classrooms
          </p>
          {!user && (
            <div className='flex gap-4 mt-8'>
              <Button size='lg' onClick={() => onOpen('register')}>
                Get Started Free
              </Button>
              <Button
                size='lg'
                variant='outline'
                onClick={() => router.push('/tutorials')}
              >
                Try Tutorial
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-4 py-12'>
        <div className='grid md:grid-cols-3 gap-8'>
          <Card>
            <CardHeader>
              <PlayCircle className='h-10 w-10 text-primary mb-2' />
              <CardTitle>Interactive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Master Python programming through hands-on practice. Write code
                and see results instantly in our interactive environment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users2 className='h-10 w-10 text-primary mb-2' />
              <CardTitle>Virtual Classrooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Join or create virtual classrooms for real-time Python learning
                with teachers and peers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className='h-10 w-10 text-primary mb-2' />
              <CardTitle>Guided Tutorials</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Step-by-step tutorials designed to take you from beginner to
                confident Python programmer.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className='container mx-auto px-4 py-12 text-center'>
        {user ? (
          <div className='space-y-4 max-w-md mx-auto'>
            <Button
              size='lg'
              onClick={() => router.push('/dashboard')}
              className='w-full'
            >
              Go to Dashboard
            </Button>
            <Button variant='secondary' onClick={signOut} className='w-full'>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className='max-w-xl mx-auto'>
            <h2 className='text-3xl font-bold mb-6'>
              Ready to start learning?
            </h2>
            <div className='flex gap-4 justify-center'>
              <Button size='lg' onClick={() => onOpen('register')}>
                Create Free Account
              </Button>
              <Button
                size='lg'
                variant='outline'
                onClick={() => onOpen('login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* <AuthModal /> */}
    </div>
  )
}