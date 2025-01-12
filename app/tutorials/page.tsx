// /tutorials

'use client'

import React, { useState } from 'react'
import { tutorials } from '#site/content'
import { TutorialItem } from '@/components/tutorials/tutorial-item'
import {
  sortTutorials,
  filterTutorialsBySearchTerm,
  sortTutorialsByTime,
} from '@/lib/tutorials/utils'
import { CustomPagination } from '@/components/pagination-query'
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
import { useAuth } from '@/contexts/AuthContext'

interface TutorialPageProps {
  searchParams: {
    page?: string
    perPage?: string
  }
}

const TutorialPage: React.FC<TutorialPageProps> = ({
  searchParams,
}: TutorialPageProps) => {
  const [searchText, setSearchText] = useState('')
  const [sortMethod, setSortMethod] = useState('Difficulty')
  const { user } = useAuth()
  console.log('user from blog page:', user)

  const publishedTutorials = filterTutorialsBySearchTerm(
    tutorials.filter((tutorial) => tutorial.published),
    searchText
  )

  const sortedTutorials =
    sortMethod === 'Difficulty'
      ? sortTutorials(publishedTutorials)
      : sortTutorialsByTime(publishedTutorials)

  const currentPage = Number(searchParams?.page) || 1
  const currentPerPage = Number(searchParams?.perPage) || 5
  const totalPages = Math.ceil(publishedTutorials.length / currentPerPage)

  const displayTutorials = sortedTutorials.slice(
    currentPerPage * (currentPage - 1),
    currentPerPage * currentPage
  )

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value)
  }

  const handleSortMethodChange = (value: string) => {
    setSortMethod(value)
  }

  return (
    <div className='container mx-auto px-8 py-8'>
      {/* Search Bar Section */}
      <div className='mb-6'>
        <Input
          type='text'
          placeholder='Search'
          value={searchText}
          onChange={handleSearchTextChange}
        />
      </div>

      {/* Header Section */}
      <div className='flex justify-between items-center mb-4'>
        <h1 className='font-black text-3xl lg:text-4xl'>Tutorials</h1>
        <Select onValueChange={handleSortMethodChange} value={sortMethod}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Sort By' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort By</SelectLabel>
              <SelectItem value='Difficulty'>Easier first</SelectItem>
              <SelectItem value='createdAt'>New first</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <hr className='my-4' />

      {/* Posts List */}
      {displayTutorials?.length > 0 ? (
        <ul className='flex flex-col space-y-4'>
          {displayTutorials.map((tutorial) => (
            <li key={tutorial.slug}>
              <TutorialItem post={tutorial} user={user} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No articles yet...</p>
      )}

      {/* Pagination */}
      <CustomPagination totalPages={totalPages} className='mt-8' />
    </div>
  )
}

export default TutorialPage