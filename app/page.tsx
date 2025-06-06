'use client'

import React, { useState, useEffect } from 'react'
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
import { useQuizzes } from '@/hooks/quiz/useQuizzes'
import { sortQuizzesByDifficulty } from '@/lib/quizzes/utils'
import QuizCard from '@/components/quiz/quiz-card'
import { themes } from '@/config/themes'
import { Badge } from '@/components/ui/badge'
import { ThemeImage } from '@/components/theme-image'
import AnimatedGradientText from '@/components/ui/animated-gradient-text'
import { LineShadowText } from '@/components/ui/line-shadow-text'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { FeatureItem } from '@/components/feature-item'
import { HighlightedText } from '@/components/ui/highlighted-text'
import { StatsCard } from '@/components/stats-card'
import { Section } from '@/components/ui/section'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn } from '@/lib/utils'
import { DotPattern } from '@/components/magicui/dot-pattern'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { onOpen } = useAuthModal()
  const sortedTutorials = sortTutorialsByTime(tutorials)
  const theme = useTheme()
  const shadowColor = theme.resolvedTheme === 'dark' ? 'white' : 'black'
  const [animationsPlayed, setAnimationsPlayed] = useState(false)
  const { quizzes } = useQuizzes()
  const sortedQuizzes = sortQuizzesByDifficulty(quizzes)

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('animationsPlayed')
    if (hasPlayed) {
      setAnimationsPlayed(true)
    } else {
      sessionStorage.setItem('animationsPlayed', 'true')
      setAnimationsPlayed(false)
    }
  }, [])

  // Determine animation props based on whether animations have played
  const getAnimationProps = () => {
    if (animationsPlayed) {
      // No animation if already played
      return {
        initial: { opacity: 1, x: 0 },
        whileInView: { opacity: 1, x: 0 },
        transition: { duration: 0 },
      }
    }
    // Default animation props for first-time viewing
    return {
      initial: { opacity: 0, x: -20 },
      whileInView: { opacity: 1, x: 0 },
      transition: { duration: 0.8 },
      viewport: { once: true },
    }
  }

  // Special animation for blurred image
  const getBlurAnimationProps = () => {
    if (animationsPlayed) {
      return {
        initial: { filter: 'blur(0px)', opacity: 1 },
        whileInView: { filter: 'blur(0px)', opacity: 1 },
        transition: { duration: 0 },
      }
    }
    return {
      initial: { filter: 'blur(10px)', opacity: 0 },
      whileInView: { filter: 'blur(0px)', opacity: 1 },
      transition: { duration: 1 },
      viewport: { once: true },
    }
  }

  // Right-to-left animation
  const getRightAnimationProps = () => {
    if (animationsPlayed) {
      return {
        initial: { opacity: 1, x: 0 },
        whileInView: { opacity: 1, x: 0 },
        transition: { duration: 0 },
      }
    }
    return {
      initial: { opacity: 0, x: 20 },
      whileInView: { opacity: 1, x: 0 },
      transition: { duration: 0.8 },
      viewport: { once: true },
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className='-mt-8'>
      {/* Hero Section */}
      <section
        className='pt-24 pb-24 xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8 bg-gradient-to-r from-background-middle
      to-background-end overflow-hidden relative'
      >
        <DotPattern
          width={15}
          height={15}
          cx={1}
          cy={1}
          cr={1}
          className={cn(
            '[mask-image:linear-gradient(to_bottom_right,white,transparent,white)]'
          )}
        />
        <div className='flex flex-col items-center text-center mx-auto relative z-10'>
          <h1 className='text-balance text-5xl leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl'>
            Python
            <LineShadowText className='italic' shadowColor={shadowColor}>
              Bit
            </LineShadowText>
          </h1>
          <h3 className='text-xl md:text-2xl'>
            Learn Python through guided tutorials and real-time classrooms
          </h3>
          {!user && (
            <div className='flex mt-8 items-center justify-center'>
              <Button
                size='lg'
                variant='animated'
                onClick={() => onOpen('register')}
              >
                <div className='flex items-center group px-2'>
                  <span className='mr-2'>🎉</span>
                  <hr className='mx-2 h-6 w-px shrink-0 bg-purple-700' />
                  <AnimatedGradientText>
                    <div className='flex items-center group'>
                      <span className='ml-2'>Start Free</span>
                      <span className='transition-transform duration-300 ease-in-out group-hover:translate-x-1'>
                        <svg width='0' height='0' className='absolute'>
                          <defs>
                            <linearGradient
                              id='my-gradient'
                              x1='0%'
                              y1='0%'
                              x2='100%'
                              y2='0%'
                            >
                              <stop offset='0%' stopColor='#c6005c' />
                              <stop offset='50%' stopColor='#d08700' />
                              <stop offset='100%' stopColor='#8200db' />
                            </linearGradient>
                          </defs>
                        </svg>
                        <ArrowRight
                          style={{ stroke: 'url(#my-gradient)' }}
                          className='h-7 w-7'
                        ></ArrowRight>
                      </span>
                    </div>
                  </AnimatedGradientText>
                </div>
              </Button>
            </div>
          )}
        </div>
      </section>
      {/* Latest Tutorials Section */}
      <Section className='bg-background'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2 className='text-3xl font-bold'>Latest Tutorials</h2>
            <p className='text-muted-foreground mt-2'>
              Start your Python journey with our latest content
            </p>
          </div>

          <Button variant='animated' onClick={() => router.push('/tutorials')}>
            <div className='flex items-center group px-2'>
              <span className='mr-2'>👩‍💻</span>
              <hr className='mx-2 h-4 w-px shrink-0 bg-purple-700' />
              <AnimatedGradientText>
                <div className='flex items-center group'>
                  <span className='ml-2'>View All Tutorials</span>
                  <span className='transition-transform duration-300 ease-in-out group-hover:translate-x-1'>
                    <ArrowRight
                      style={{ stroke: 'url(#my-gradient)' }}
                      className='h-4 w-4'
                    ></ArrowRight>
                  </span>
                </div>
              </AnimatedGradientText>
            </div>
          </Button>
        </div>

        <motion.div {...getAnimationProps()} className='space-y-6'>
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
      </Section>
      {/* Why Python Bit Section */}
      <Section className='bg-background-middle border-t-2 border-[hsl(var(--border-top))] relative'>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className={cn(
            '[mask-image:linear-gradient(to_top_right,white,transparent,white)]'
          )}
        />
        <div className='flex flex-col items-center gap-12 max-w-4xl mx-auto relative z-10'>
          {/* Problem Section */}
          <motion.div {...getAnimationProps()} className='space-y-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <Badge className='bg-gradient-to-r from-purple-500 to-purple-500 p-1'>
                The Challenge
              </Badge>
              <h2 className='text-3xl font-bold'>
                Why do students fear real programming?
              </h2>
            </div>

            <Card className='p-6 border border-purple-500/20'>
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
              {...getBlurAnimationProps()}
              className='max-w-lg mx-auto'
            >
              <Image
                src='/home/student.png'
                alt='Students struggling with programming'
                width={300}
                height={500}
                className='object-cover w-full h-auto rounded-xl shadow-2xl shadow-purple-500/50 transition-all duration-700 ease-in-out'
              />
            </motion.div>
          </motion.div>

          {/* Solution Section */}
          <motion.div {...getRightAnimationProps()} className='space-y-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <Badge className='bg-gradient-to-r from-purple-500 to-purple-500 p-1'>
                The Solution
              </Badge>
              <h2 className='text-3xl font-bold'>
                Master Python with joy and support
              </h2>
            </div>

            <Card className='p-6 border border-purple-500/20'>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                We are revolutionizing Python learning through
                <HighlightedText>three powerful pillars</HighlightedText>:
                <HighlightedText>engaging tutorials</HighlightedText> that make
                concepts click,
                <HighlightedText>real-time classrooms</HighlightedText> with
                instant AI and teacher feedback, and
                <HighlightedText>creative projects</HighlightedText> that bring
                code to life. Students master Python through hands-on
                experiences that feel like adventures, not lessons. By combining
                these three core elements with immediate guidance anywhere, we
                are building confident programmers who can turn their ideas into
                reality.
              </p>

              <div className='grid grid-cols-3 gap-4 mt-6'>
                <StatsCard number='24/7' text='Instant Support' />
                <StatsCard number='100+' text='Projects' />
                <StatsCard number='50+' text='Tutorials' />
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>
      {/* Integrated Features Section */}
      <Section className='bg-background'>
        <h2 className='text-3xl font-bold text-center mb-6'>
          Learning Together
        </h2>
        <p className='text-muted-foreground text-center mb-12 text-lg'>
          Features for students and teachers
        </p>

        <motion.div
          {...getAnimationProps()}
          className='grid md:grid-cols-2 gap-12 items-center'
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
                className='object-cover w-full h-auto rounded-xl shadow-2xl shadow-purple-500 transition-all duration-700 ease-in-out'
              />
            </div>
          </div>
        </motion.div>

        {/* Teacher Features Section */}
        <motion.div
          {...getRightAnimationProps()}
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
                className='object-cover w-full h-auto rounded-xl shadow-2xl shadow-purple-500 transition-all duration-700 ease-in-out'
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
      </Section>
      {/* Quizzes Section */}
      <Section className='bg-[hsl(var(--background-end-lighter))] border-t-2 border-[hsl(var(--border-top-secondary))] relative'>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className={cn(
            '[mask-image:linear-gradient(to_bottom_right,white,transparent,white)]'
          )}
        />
        <div className='flex justify-between items-center mb-8 relative z-10'>
          <div>
            <h2 className='text-3xl font-bold'>Quizzes</h2>
            <p className='text-muted-foreground mt-2'>
              Reinforce your learning with engaging quizzes.
            </p>
          </div>
          <Button variant='animated' onClick={() => router.push('/quizzes')}>
            <div className='flex items-center group px-2'>
              <span className='mr-2'>🚦</span>
              <hr className='mx-2 h-4 w-px shrink-0 bg-purple-700' />
              <AnimatedGradientText>
                <div className='flex items-center group'>
                  <span className='ml-2'>View All Quizzes</span>
                  <span className='transition-transform duration-300 ease-in-out group-hover:translate-x-1'>
                    <ArrowRight
                      style={{ stroke: 'url(#my-gradient)' }}
                      className='h-4 w-4'
                    ></ArrowRight>
                  </span>
                </div>
              </AnimatedGradientText>
            </div>
          </Button>
        </div>

        <motion.div
          {...getAnimationProps()}
          className='space-y-6 relative z-10'
        >
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {sortedQuizzes.slice(0, 3).map((quiz) => (
              <QuizCard
                key={quiz.id}
                id={quiz.id}
                title={quiz.title}
                description={quiz.description}
                tutorialId={quiz.tutorialId}
                questionCount={quiz.questions.length}
                imageUrl={quiz.imageUrl}
              />
            ))}
          </div>
        </motion.div>
      </Section>
      {/* Project Themes Section */}
      <Section className='bg-background'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2 className='text-3xl font-bold'>Project Themes</h2>
            <p className='text-muted-foreground mt-2'>
              Build exciting projects based on your interests
            </p>
          </div>
          <Button variant='animated' onClick={() => router.push('/projects')}>
            <div className='flex items-center group px-2'>
              <span className='mr-2'>😎</span>
              <hr className='mx-2 h-4 w-px shrink-0 bg-purple-700' />
              <AnimatedGradientText>
                <div className='flex items-center group'>
                  <span className='ml-2'>View All Projects</span>
                  <span className='transition-transform duration-300 ease-in-out group-hover:translate-x-1'>
                    <ArrowRight
                      style={{ stroke: 'url(#my-gradient)' }}
                      className='h-4 w-4'
                    ></ArrowRight>
                  </span>
                </div>
              </AnimatedGradientText>
            </div>
          </Button>
        </div>

        <motion.div {...getAnimationProps()} className='space-y-6'>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {themes.slice(0, 3).map((theme, index) => (
              <Card
                key={index}
                className='flex flex-col hover:shadow-lg transition-shadow'
              >
                <div className='relative w-full h-48 overflow-hidden'>
                  <ThemeImage
                    src={`/themes/${theme.image}`}
                    alt={theme.title}
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
          </div>
        </motion.div>
      </Section>
      {/* Call to Action */}
      <Section
        className='bg-gradient-to-r from-[hsl(var(--background-end))]
      to-[hsl(var(--background-middle))] relative'
      >
        <DotPattern
          width={15}
          height={15}
          cx={1}
          cy={1}
          cr={1}
          className={cn(
            '[mask-image:linear-gradient(to_top_right,white,transparent,white)]'
          )}
        />
        {user ? (
          <div className='max-w-md mx-auto relative z-10'>
            <Button
              size='lg'
              onClick={() => router.push('/dashboard')}
              className='w-full'
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center text-center max-w-xl mx-auto'>
            <h2 className='text-4xl font-bold mb-2'>
              Start For Free
            </h2>
            <h3 className='text-lg mb-8'>
              Join our platform and start your coding adventure today!
            </h3>
            <div className='flex gap-4 justify-center md:flex-col'>
              <Button
                size='lg'
                variant='animated'
                onClick={() => onOpen('register')}
              >
                <div className='flex items-center group'>
                  <span className='mr-2'>🎉</span>
                  <hr className='mx-2 h-6 w-px shrink-0 bg-purple-700' />
                  <AnimatedGradientText>
                    <div className='flex items-center group'>
                      <span className='ml-2'>Start Free</span>
                      <span className='transition-transform duration-300 ease-in-out group-hover:translate-x-1'>
                        <svg width='0' height='0' className='absolute'>
                          <defs>
                            <linearGradient
                              id='my-gradient'
                              x1='0%'
                              y1='0%'
                              x2='100%'
                              y2='0%'
                            >
                              <stop offset='0%' stopColor='#c6005c' />
                              <stop offset='50%' stopColor='#d08700' />
                              <stop offset='100%' stopColor='#8200db' />
                            </linearGradient>
                          </defs>
                        </svg>
                        <ArrowRight
                          style={{ stroke: 'url(#my-gradient)' }}
                          className='h-7 w-7'
                        ></ArrowRight>
                      </span>
                    </div>
                  </AnimatedGradientText>
                </div>
              </Button>
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}
