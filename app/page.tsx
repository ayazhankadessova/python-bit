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
import { sortTutorialsByTime } from '@/lib/tutorials/utils'
import { themes } from '@/config/themes'
import { Badge } from '@/components/ui/badge'
import { ThemeImage } from '@/components/theme-image'
import { ChevronRight } from 'lucide-react'
import AnimatedGradientText from '@/components/ui/animated-gradient-text'
import { LineShadowText } from '@/components/ui/line-shadow-text'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { FeatureItem } from '@/components/feature-item'
import { HighlightedText } from '@/components/ui/highlighted-text'
import { StatsCard } from '@/components/stats-card'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { onOpen } = useAuthModal()
  const sortedTutorials = sortTutorialsByTime(tutorials)
  const theme = useTheme()
  const shadowColor = theme.resolvedTheme === 'dark' ? 'white' : 'black'

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
          <h1 className='text-balance text-5xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl'>
            Python
            <LineShadowText className='italic' shadowColor={shadowColor}>
              Bit
            </LineShadowText>
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            Learn Python through guided tutorials and real-time classrooms
          </p>
          {!user && (
            <div className='flex gap-4 mt-8'>
              <Button
                size='lg'
                variant='animated'
                onClick={() => onOpen('register')}
              >
                🎉 <hr className='mx-2 h-4 w-px shrink-0 bg-gray-300' />{' '}
                <AnimatedGradientText text='Get Started Free' />
                <ChevronRight className='ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5' />
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

          <Button variant='animated' onClick={() => router.push('/tutorials')}>
            🧑‍🎓 <hr className='mx-2 h-4 w-px shrink-0 bg-gray-300' />{' '}
            <AnimatedGradientText text='View All Tutorials' />
            <ChevronRight className='ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5' />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          className='space-y-6'
          viewport={{ once: true }}
        >
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {sortedTutorials.slice(0, 3).map((tutorial) => (
              <Card
                key={tutorial.slug}
                className='flex flex-col overflow-hidden'
              >
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
                  <CardTitle className='line-clamp-2'>
                    {tutorial.title}
                  </CardTitle>
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
        </motion.div>
      </section>

      {/* Why Python Bit Section */}
      <section className='container mx-auto px-4 py-16 md:py-20'>
        <div className='flex flex-col items-center gap-12 max-w-4xl mx-auto'>
          {/* Problem Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className='space-y-6'
          >
            <div className='flex flex-col items-center text-center space-y-4'>
              <Badge className='bg-gradient-to-r from-blue-500 to-purple-500 p-1'>
                The Challenge
              </Badge>
              <h2 className='text-3xl font-bold'>
                Why do students fear real programming?
              </h2>
            </div>

            <Card className='p-6 border border-blue-500/20'>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                <HighlightedText>Millions of students</HighlightedText> hit a
                wall when moving from block-based to text programming, with{' '}
                <HighlightedText>50% losing confidence</HighlightedText> in the
                transition. While block coding makes programming accessible, the
                leap to
                <HighlightedText> professional languages</HighlightedText> like
                Python feels like stepping into darkness. Their creative
                potential gets trapped between colorful blocks and intimidating
                text syntax, often crushing their dreams of becoming real
                developers.
              </p>

              <div className='grid grid-cols-2 gap-4 mt-6'>
                <StatsCard number='50%' text='Students Lose Confidence' />
                <StatsCard number='35M+' text='Affected Students' />
              </div>
            </Card>

            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              whileInView={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 1 }}
              className='max-w-lg mx-auto'
            >
              <Image
                src='/home/student.png'
                alt='Students struggling with programming'
                width={300}
                height={500}
                className='object-cover w-full h-auto rounded-xl shadow-2xl shadow-blue-500/50 transition-all duration-700 ease-in-out'
              />
            </motion.div>
          </motion.div>

          {/* Solution Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className='space-y-6'
          >
            <div className='flex flex-col items-center text-center space-y-4'>
              <Badge className='bg-gradient-to-r from-blue-500 to-purple-500 p-1'>
                The Solution
              </Badge>
              <h2 className='text-3xl font-bold'>
                Master Python with joy and support
              </h2>
            </div>

            <Card className='p-6 border border-blue-500/20'>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                We're revolutionizing Python learning through{' '}
                <HighlightedText>three powerful pillars</HighlightedText>:
                <HighlightedText>engaging tutorials</HighlightedText> that make
                concepts click,
                <HighlightedText>real-time classrooms</HighlightedText> with
                instant AI and teacher feedback, and
                <HighlightedText>creative projects</HighlightedText> that bring
                code to life. Students master Python through hands-on
                experiences that feel like adventures, not lessons. By combining
                these three core elements with immediate guidance anywhere,
                we're building confident programmers who can turn their ideas
                into reality.
              </p>

              <div className='grid grid-cols-3 gap-4 mt-6'>
                <StatsCard number='24/7' text='Instant Support' />
                <StatsCard number='100+' text='Projects' />
                <StatsCard number='50+' text='Tutorials' />
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      {/* Integrated Features Section */}
      <section className='container mx-auto px-4 py-16 md:py-20'>
        <h2 className='text-3xl font-bold text-center mb-6'>
          Learning Together
        </h2>
        <p className='text-muted-foreground text-center mb-12 text-lg'>
          Features for students and teachers
        </p>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className='grid md:grid-cols-2 gap-12 mb-24 items-center'
        >
          {/* Student Features */}
          <div className='space-y-8 pr-8 md:pr-16'>
            <h3 className='text-2xl font-semibold mb-6'>For Students</h3>
            <FeatureItem
              icon={<PlayCircle className='h-6 w-6 text-primary' />}
              title='Interactive Learning'
              description='Create fun projects and see results instantly in our interactive environment.'
              buttonText='Explore Projects'
              buttonLink='/projects'
              router={router}
            />
            <FeatureItem
              icon={<Users2 className='h-6 w-6 text-primary' />}
              title='Virtual Classrooms'
              description='Learn real-time with teachers and peers.'
              buttonText='Join Classroom'
              buttonLink='/classrooms'
              router={router}
            />
            <FeatureItem
              icon={<BookOpen className='h-6 w-6 text-primary' />}
              title='Guided Tutorials'
              description='Step-by-step tutorials to become a confident Python programmer.'
              buttonText='Start Learning'
              buttonLink='/tutorials'
              router={router}
            />
          </div>

          {/* Student Image with gradient card */}
          <div className='flex justify-end'>
            <div className='w-4/5'>
              <Image
                src='/home/tutorials.png'
                alt='Student learning Python'
                width={300}
                height={500}
                className='object-cover w-full h-auto rounded-xl shadow-2xl shadow-blue-500 transition-all duration-700 ease-in-out'
              />
            </div>
          </div>
        </motion.div>

        {/* Teacher Features Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className='grid md:grid-cols-2 gap-12 items-center'
        >
          {/* Teacher Image with gradient card */}
          <div className='flex justify-start'>
            <div className='w-4/5'>
              <Image
                src='/home/real-time-classroom.png'
                alt='Teacher teaching students'
                width={300}
                height={500}
                className='object-cover w-full h-auto rounded-xl shadow-2xl shadow-blue-500 transition-all duration-700 ease-in-out'
              />
            </div>
          </div>

          {/* Teacher Features */}
          <div className='space-y-8 pl-8 md:pl-16'>
            <h3 className='text-2xl font-semibold mb-6'>For Teachers</h3>
            <FeatureItem
              icon={<GraduationCap className='h-6 w-6 text-primary' />}
              title='Create Virtual Classrooms'
              description='Set up interactive learning environments and track progress in real-time.'
              buttonText='Create Classroom'
              buttonLink='/classrooms'
              router={router}
            />
            <FeatureItem
              icon={<Code className='h-6 w-6 text-primary' />}
              title='Real-time Code Sharing'
              description='Share code snippets and provide instant feedback to students.'
              buttonText='Learn More'
              buttonLink='/classrooms'
              router={router}
            />
            <FeatureItem
              icon={<BookMarked className='h-6 w-6 text-primary' />}
              title='Teaching Resources'
              description='Access our curated collection of lesson plans and curriculum guides.'
              buttonText='View Resources'
              buttonLink='/teaching-content/learning-topics'
              router={router}
            />
          </div>
        </motion.div>
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
          <Button variant='animated' onClick={() => router.push('/projects')}>
            😎 <hr className='mx-2 h-4 w-px shrink-0 bg-gray-300' />{' '}
            <AnimatedGradientText text='View All Projects' />
            <ChevronRight className='ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5' />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          className='space-y-6'
          viewport={{ once: true }}
        >
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
        </motion.div>
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
              <Button
                size='lg'
                variant='animated'
                onClick={() => onOpen('register')}
              >
                🎉 <hr className='mx-2 h-4 w-px shrink-0 bg-gray-300' />{' '}
                <AnimatedGradientText text='Get Started Free' />
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
