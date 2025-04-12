"use client"
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { ThemeImage } from '@/components/theme-image'
import { themes } from '@/config/themes'


const ProjectThemes = () => {

  const router = useRouter()

  return (
    <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8 pt-8 mb-16'>
      <div className='mb-16'>
        <h1 className='text-4xl mb-2'>Projects</h1>
        <p className='text-muted-foreground max-w-2xl'>
          Explore a variety of Python projects designed to help you apply your
          knowledge and build practical skills. Each project is tailored to
          different themes and difficulty levels, allowing you to learn by doing
          and create something amazing.
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {themes.map((theme, index) => (
          <Card
            key={index}
            className='hover:shadow-lg transition-shadow overflow-hidden flex flex-col'
          >
            <ThemeImage src={`/themes/${theme.image}`} alt={theme.title}/>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  {theme.icon}
                  <CardTitle>{theme.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2 mb-4'>
                <Badge variant='outline'>{theme.difficulty}</Badge>
                <Badge variant='outline'>{theme.estimatedTime}</Badge>
              </div>
              <ul className='list-disc ml-4 space-y-2'>
                {theme.projects.map((project, idx) => (
                  <li key={idx}>{project}</li>
                ))}
              </ul>
            </CardContent>
            <Button
              className='mt-auto mb-6 mx-6'
              variant='softBlue'
              onClick={() =>
                router.push(
                  `/projects/${theme.title.toLowerCase().replace(/\s+/g, '-')}`
                )
              }
            >
              Go to Theme
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProjectThemes
