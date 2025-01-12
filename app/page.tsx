'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Loader2,
  PlayCircle,
  BookOpen,
  Users2,
  ArrowRight,
  GraduationCap,
  Code,
  BookMarked,
} from 'lucide-react'
import { useAuthModal } from '@/contexts/AuthModalContext'
import Image from 'next/image'
import { tutorials } from '#site/content'
import {
  sortTutorialsByTime,
} from '@/lib/tutorials/utils'
import { themes } from '@/config/themes'
import { Badge } from '@/components/ui/badge'
import { ThemeImage } from '@/components/theme-image'


export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { onOpen } = useAuthModal()  
  const sortedTutorials = sortTutorialsByTime(tutorials)

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen px-8'>
      {/* Hero Section */}
      <section className='container mx-auto px-4 pt-12 pb-6 md:pt-18 md:pb-4'>
        <div className='flex flex-col items-center text-center max-w-3xl mx-auto space-y-6'>
          <h1 className='text-4xl md:text-6xl font-bold tracking-tight'>
            PythonBit ()
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            Learn Python through guided tutorials and real-time classrooms
          </p>
          {!user && (
            <div className='flex gap-4 mt-8'>
              <Button size='lg' onClick={() => onOpen('register')}>
                Get Started Free
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Latest Tutorials Section */}
      <section className='container mx-auto px-4 py-14 md:py-18'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2 className='text-3xl font-bold'>Latest Tutorials</h2>
            <p className='text-muted-foreground mt-2'>
              Start your Python journey with our latest content
            </p>
          </div>
          <Button variant='softBlue' onClick={() => router.push('/tutorials')}>
            View All Tutorials
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sortedTutorials.slice(0, 3).map((tutorial) => (
            <Card key={tutorial.slug} className='flex flex-col overflow-hidden'>
              <div className='relative w-full aspect-[2/1]'>
                <Image
                  src={`/tutorials/${tutorial.firestoreId}.webp`}
                  alt={tutorial.title}
                  fill
                  className='object-cover'
                  sizes='(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                />
              </div>
              <CardHeader>
                <CardTitle className='line-clamp-2'>{tutorial.title}</CardTitle>
              </CardHeader>
              <CardContent className='flex-grow'>
                <p className='text-muted-foreground line-clamp-2'>
                  {tutorial.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant='softBlue'
                  className='w-full'
                  onClick={() => router.push(`/${tutorial.slug}`)}
                >
                  Start Tutorial
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Integrated Features Section */}
      <section className='container mx-auto px-4 py-16 md:py-20'>
        {/* <div className='max-w-6xl mx-auto'> */}
        <h2 className='text-3xl font-bold text-center mb-6'>
          Learning Together
        </h2>
        <p className='text-muted-foreground text-center mb-12 text-lg'>
          Features for students and teachers to make Python learning engaging
        </p>

        <div className='grid md:grid-cols-2 gap-12'>
          {/* Grid Container for Feature Rows */}
          <div className='grid grid-rows-3 gap-8 content-start'>
            <div className='flex gap-6 items-start'>
              <div className='flex-shrink-0 p-3 rounded-lg shadow-md shadow-blue-200'>
                <PlayCircle className='h-6 w-6 text-primary' />
              </div>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-xl font-semibold mb-2'>
                    Interactive Learning
                  </h4>
                  <p className='text-muted-foreground'>
                    Create fun projects and see results instantly in our
                    interactive environment.
                  </p>
                </div>
                <Button
                  className='group'
                  variant='softBlue'
                  onClick={() => router.push('/projects')}
                >
                  Explore Projects
                  <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
              </div>
            </div>

            <div className='flex gap-6 items-start'>
              <div className='flex-shrink-0 p-3 rounded-lg shadow-md shadow-blue-200'>
                <Users2 className='h-6 w-6 text-primary' />
              </div>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-xl font-semibold mb-2'>
                    Virtual Classrooms
                  </h4>
                  <p className='text-muted-foreground'>
                    Learn real-time with teachers and peers.
                  </p>
                </div>
                <Button
                  className='group'
                  variant='softBlue'
                  onClick={() => router.push('/classrooms')}
                >
                  Join Classroom
                  <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
              </div>
            </div>

            <div className='flex gap-6 items-start'>
              <div className='flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md shadow-blue-200'>
                <BookOpen className='h-6 w-6 text-primary' />
              </div>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-xl font-semibold mb-2'>
                    Guided Tutorials
                  </h4>
                  <p className='text-muted-foreground'>
                    Step-by-step tutorials to become a confident Python
                    programmer.
                  </p>
                </div>
                <Button
                  className='group'
                  variant='softBlue'
                  onClick={() => router.push('/tutorials')}
                >
                  Start Learning
                  <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
              </div>
            </div>
          </div>

          <div className='grid grid-rows-3 gap-8 content-start'>
            <div className='flex gap-6 items-start'>
              <div className='flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md shadow-blue-200'>
                <GraduationCap className='h-6 w-6 text-primary' />
              </div>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-xl font-semibold mb-2'>
                    Create Virtual Classrooms
                  </h4>
                  <p className='text-muted-foreground'>
                    Set up interactive learning environments and track progress
                    in real-time.
                  </p>
                </div>
                <Button
                  className='group'
                  variant='softBlue'
                  onClick={() => router.push('/classrooms')}
                >
                  Create Classroom
                  <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
              </div>
            </div>

            <div className='flex gap-6 items-start'>
              <div className='flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md shadow-blue-200'>
                <Code className='h-6 w-6 text-primary' />
              </div>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-xl font-semibold mb-2'>
                    Real-time Code Sharing
                  </h4>
                  <p className='text-muted-foreground'>
                    Share code snippets and provide instant feedback to
                    students.
                  </p>
                </div>
                <Button
                  className='group'
                  variant='softBlue'
                  onClick={() => router.push('/classrooms')}
                >
                  Learn More
                  <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
              </div>
            </div>

            <div className='flex gap-6 items-start'>
              <div className='flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md shadow-blue-200'>
                <BookMarked className='h-6 w-6 text-primary' />
              </div>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-xl font-semibold mb-2'>
                    Teaching Resources
                  </h4>
                  <p className='text-muted-foreground'>
                    Access our curated collection of lesson plans and curriculum
                    guides.
                  </p>
                </div>
                <Button
                  className='group'
                  variant='softBlue'
                  onClick={() =>
                    router.push('/teaching-content/learning-topics')
                  }
                >
                  View Resources
                  <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* </div> */}
      </section>

      {/* Project Themes Section */}
      <section className='container mx-auto px-4 py-16 md:py-20'>
        {/* <div className='max-w-6xl mx-auto'> */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2 className='text-3xl font-bold'>Project Themes</h2>
            <p className='text-muted-foreground mt-2'>
              Build exciting projects based on your interests
            </p>
          </div>
          <Button variant='softBlue' onClick={() => router.push('/projects')}>
            View All Projects
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {themes.slice(0, 3).map((theme, index) => (
            <Card
              key={index}
              className='flex flex-col hover:shadow-lg transition-shadow'
            >
              <div className='relative w-full h-48 overflow-hidden'>
                <ThemeImage
                  src={theme.image}
                  // alt={theme.title}
                  // fill
                  // className='object-cover rounded-t-lg'
                />
              </div>
              <CardHeader>
                <div className='flex items-center gap-3 mb-2'>
                  {theme.icon}
                  <CardTitle>{theme.title}</CardTitle>
                </div>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              <CardContent className='flex-grow'>
                <div className='flex gap-2 mb-4'>
                  <Badge variant='outline'>{theme.difficulty}</Badge>
                  <Badge variant='outline'>{theme.estimatedTime}</Badge>
                </div>
                <ul className='list-disc ml-4 space-y-1'>
                  {theme.projects.slice(0, 3).map((project, idx) => (
                    <li key={idx} className='text-sm text-muted-foreground'>
                      {project}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className='pt-2'>
                <Button
                  className='w-full group'
                  variant='softBlue'
                  onClick={() =>
                    router.push(
                      `/projects/${theme.title
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`
                    )
                  }
                >
                  Explore Theme
                  <ArrowRight className='ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1' />
                </Button>
              </CardFooter>
            </Card>
          ))}
          {/* </div> */}
        </div>
      </section>

      {/* Call to Action */}
      <section className='container mx-auto px-4 py-16 md:py-20 text-center'>
        {user ? (
          <div className='space-y-4 max-w-md mx-auto'>
            <Button
              size='lg'
              onClick={() => router.push('/dashboard')}
              className='w-full'
            >
              Go to Dashboard
            </Button>
            <Button variant='softBlue' onClick={signOut} className='w-full'>
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
                Get Started Free
              </Button>
              <Button
                size='lg'
                variant='softBlue'
                onClick={() => onOpen('login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
