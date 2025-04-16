'use client'
import QuizCard from '@/components/quiz/quiz-card'
import { useQuizzes } from '@/hooks/quiz/useQuizzes'
import { LoadingSpinner } from '@/components/LoadingSpinner'
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
import { use, useState } from 'react'
import { CustomPagination } from '@/components/pagination-query'
import {filterQuizzesBySearchTerm,  sortQuizzesByDifficulty, sortQuizzesByTime} from "@/lib/quizzes/utils"

interface QuizPageProps {
  searchParams: Promise<{
    page?: string
    perPage?: string
  }>
}

export default function QuizzesPage(props: QuizPageProps) {
  const { quizzes, isLoading, error } = useQuizzes()
  const searchParams = use(props.searchParams)
  const [searchText, setSearchText] = useState('')
  const [sortMethod, setSortMethod] = useState('Difficulty')

  // Apply filter by search term to published quizzes
  const filteredQuizzes = filterQuizzesBySearchTerm(quizzes || [], searchText)

  // Apply sorting based on selected method
  const sortedQuizzes =
    sortMethod === 'Difficulty'
      ? sortQuizzesByDifficulty(filteredQuizzes)
      : sortQuizzesByTime(filteredQuizzes)

  // Pagination logic
  const currentPage = Number(searchParams?.page) || 1
  const currentPerPage = Number(searchParams?.perPage) || 5
  const totalPages = Math.ceil(sortedQuizzes.length / currentPerPage)
  const displayQuizzes = sortedQuizzes.slice(
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

  if (isLoading) return <LoadingSpinner />
  if (error) {
    return (
      <div>
        <h2 className='text-xl font-normal text-red-500'>
          Failed to load quizzes
        </h2>
        <p className='text-muted-foreground mt-2'>
          Please try again later or check your connection.
        </p>
      </div>
    )
  }

  return (
    <div className='xl:px-24 lg:px-16 md:px-8 sm:px-8 px-8 pt-8 mb-16'>
      <div className='mb-16'>
        <h1 className='text-4xl mb-2'>Quizzes</h1>
        <p className='text-muted-foreground max-w-2xl'>
          Test your Python knowledge with our interactive quizzes. Each quiz is
          thoughtfully designed to reinforce key concepts from our tutorials and
          help you master Python programming skills effectively and confidently.
        </p>
      </div>
      <div className='flex justify-between mb-8 items-center sm:gap-6 md:gap-12 lg:gap-16'>
        {/* Search Bar Section */}
        <Input
          type='text'
          placeholder='Search'
          value={searchText}
          onChange={handleSearchTextChange}
        />
        <Select
          defaultValue={sortMethod}
          onValueChange={handleSortMethodChange}
        >
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
      {!quizzes || quizzes.length === 0 ? (
        <div className='text-center py-12'>
          <h2 className='text-xl font-normal'>No quizzes available</h2>
          <p className='text-muted-foreground mt-2'>
            Check back later for new quizzes to test your knowledge!
          </p>
        </div>
      ) : displayQuizzes.length === 0 ? (
        <div className='text-center py-12'>
          <h2 className='text-xl font-normal'>No quizzes match your search</h2>
          <p className='text-muted-foreground mt-2'>
            Try adjusting your search term or try a different filter.
          </p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {displayQuizzes.map((quiz) => (
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
          <div className='mt-8 flex justify-center'>
            <CustomPagination totalPages={totalPages} />
          </div>
        </>
      )}
    </div>
  )
}
