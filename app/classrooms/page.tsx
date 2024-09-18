'use client'

import React, { useState } from 'react'
import { Search, Plus, Play } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

interface Classroom {
  id: number
  grade: string
  programme: string
  lastTopic: string
}

const classrooms: Classroom[] = [
  {
    id: 1,
    grade: 'Grade 6A',
    programme: 'Python for Beginners',
    lastTopic: 'Variables',
  },
  {
    id: 2,
    grade: 'Grade 7B',
    programme: 'Intermediate Python',
    lastTopic: 'Functions',
  },
  {
    id: 3,
    grade: 'Grade 7C',
    programme: 'Advanced Python',
    lastTopic: 'Object-Oriented Programming',
  },
]

const ClassroomPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.programme.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleCreateClassroom = () => {
    // TODO: Implement classroom creation logic
    console.log('Create new classroom')
  }

  const handleStartLesson = (classroomId: number) => {
    // TODO: Implement start lesson logic
    console.log(`Start lesson for classroom ${classroomId}`)
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>My Classrooms</h1>

      <div className='flex justify-between mb-6'>
        <div className='relative w-64'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
          <Input
            type='text'
            placeholder='Search classrooms'
            className='pl-8'
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Button onClick={handleCreateClassroom}>
          <Plus className='mr-2 h-4 w-4' /> Create New Classroom
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredClassrooms.map((classroom) => (
          <Card key={classroom.id}>
            <CardHeader>
              <CardTitle>{classroom.grade}</CardTitle>
              <CardDescription>{classroom.programme}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Last topic: {classroom.lastTopic}</p>
            </CardContent>
            <CardFooter>
              <Button
                className='w-full'
                onClick={() => handleStartLesson(classroom.id)}
              >
                <Play className='mr-2 h-4 w-4' /> Start Lesson
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClassroomPage
