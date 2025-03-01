// projects/page.tsx
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
    <div className='container mx-auto px-8 py-8'>
      <h1 className='text-4xl font-bold mb-8'>Projects</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {themes.map((theme, index) => (
          <Card
            key={index}
            className='hover:shadow-lg transition-shadow overflow-hidden flex flex-col'
          >
            <ThemeImage src={theme.image} />
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
