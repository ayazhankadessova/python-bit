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
import BackButton from '@/components/ui/backbutton'
import { SharePost } from '@/components/share-post'
import { siteConfig } from '@/config/site'
import { ProjectItem } from '@/components/projects/project-item'
import { filterProjectsBySearchTerm } from '@/lib/projects/utils'

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

  // Filter projects by theme
  const themeProjectsOne = projects.filter(
    (project) => project.theme === params.theme
  )

  // Filter by search
  const themeProjects = filterProjectsBySearchTerm(themeProjectsOne, searchText)

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
  const fullLinkGenerated = `${siteConfig.url}/projects/${params.theme}`
  

  const displayProjects = sortedProjects.slice(
    currentPerPage * (currentPage - 1),
    currentPerPage * currentPage
  )

  return (
    <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 pt-8 mb-16'>
      <div className='flex justify-between mb-4 ml-1'>
        <BackButton href='/projects' />
        <SharePost fullLink={fullLinkGenerated} />
      </div>

      <h1 className='font-bold text-4xl mb-16 capitalize'>
        {params.theme.replace('-', ' ')} Projects
      </h1>

      <div className='space-y-6'>
        <div className='flex gap-4 justify-between'>
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
              <ProjectItem key={project.slugAsParams} project={project} />
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