// app/projects/[theme]/page.tsx
'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { projects } from '#site/content'
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

interface ThemePageProps {
  params: {
    theme: string
  }
  searchParams: {
    page?: string
    perPage?: string
  }
}

const ThemePage = ({ params, searchParams }: ThemePageProps) => {
  const [searchText, setSearchText] = useState('')
  const [sortMethod, setSortMethod] = useState('createdAt')
  const router = useRouter()

  // Filter projects by theme
  const themeProjects = projects.filter(
    (project) => project.theme === params.theme
  )

  // Filter by search
  // const filteredProjects = filterPostsBySearchTerm(themeProjects, searchText)

  // Sort projects
  const sortedProjects =
    sortMethod === 'createdAt'
      ? [...themeProjects].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      : [...themeProjects].sort((a, b) => a.title.localeCompare(b.title))

  // Pagination
  const currentPage = Number(searchParams?.page) || 1
  const currentPerPage = Number(searchParams?.perPage) || 5
  // const totalPages = Math.ceil(sortedProjects.length / currentPerPage)

  const displayProjects = sortedProjects.slice(
    currentPerPage * (currentPage - 1),
    currentPerPage * currentPage
  )

  const handleProjectClick = (slug: string) => {
    router.push(`/projects/${params.theme}/${slug}`)
  }

  return (
    <div className='container mx-auto px-8 py-8'>
      <h1 className='font-bold text-4xl mb-6 capitalize'>
        {params.theme.replace('-', ' ')} Projects
      </h1>

      <div className='space-y-6'>
        <div className='flex gap-4'>
          <Input
            type='text'
            placeholder='Search projects...'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className='max-w-sm'
          />

          <Select onValueChange={setSortMethod} value={sortMethod}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort By' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value='createdAt'>Date Created</SelectItem>
                <SelectItem value='title'>Title</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {displayProjects.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {displayProjects.map((project) => (
              <Card
                key={project.slugAsParams}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <CardTitle>{project.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2 mb-4'>
                    <Badge variant='outline'>{project.difficulty}</Badge>
                    <Badge variant='outline'>{project.estimatedTime}</Badge>
                  </div>
                  <Button
                    className='w-full mt-4'
                    onClick={() => handleProjectClick(project.slugAsParams)}
                  >
                    Start Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className='text-center text-muted-foreground'>
            No projects found for this theme...
          </p>
        )}
      </div>
    </div>
  )
}

export default ThemePage