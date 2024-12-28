'use client'

import React, { useState } from 'react'
import { posts } from '#site/content'
import { PostItem } from '@/components/post-item'
import {
  sortPosts,
  filterPostsBySearchTerm,
  sortPostsByTime,
} from '@/utils/posts'
import '@/styles/mdx-style.css'
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

interface BlogPageProps {
  searchParams: {
    page?: string
    perPage?: string
  }
}

const BlogPage: React.FC<BlogPageProps> = ({ searchParams }: BlogPageProps) => {
  const [searchText, setSearchText] = useState('')
  const [sortMethod, setSortMethod] = useState('Difficulty')
  const { user } = useAuth()
  console.log("user from blog page:" , user)

  const publishedPosts = filterPostsBySearchTerm(
    posts.filter((post) => post.published),
    searchText
  )

  const sortedPosts =
    sortMethod === 'Difficulty'
      ? sortPosts(publishedPosts)
      : sortPostsByTime(publishedPosts)

  const currentPage = Number(searchParams?.page) || 1
  const currentPerPage = Number(searchParams?.perPage) || 5
  const totalPages = Math.ceil(publishedPosts.length / currentPerPage)

  const displayPosts = sortedPosts.slice(
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
    <div className='container max-w-4xl py-2 lg:py-3 px-1'>
      <div className='mb-6 pr-20 mr-20'>
        <Input
          type='text'
          placeholder='Search'
          value={searchText}
          onChange={handleSearchTextChange}
        />
      </div>
      <div className='flex justify-between'>
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
      <hr className='mt-4' />
      {displayPosts?.length > 0 ? (
        <ul className='flex flex-col'>
          {displayPosts.map((post) => (
            <li key={post.slug}>
              <PostItem post={post} user={user} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No articles yet...</p>
      )}
      <CustomPagination totalPages={totalPages} className='mt-4' />
    </div>
  )
}

export default BlogPage
