// 'use client'

// import React, { useState } from 'react'
// import { Search, Plus, Play } from 'lucide-react'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from '@/components/ui/card'

// interface Classroom {
//   id: number
//   grade: string
//   programme: string
//   lastTopic: string
// }

// const classrooms: Classroom[] = [
//   {
//     id: 1,
//     grade: 'Grade 6A',
//     programme: 'Python for Beginners',
//     lastTopic: 'Variables',
//   },
//   {
//     id: 2,
//     grade: 'Grade 7B',
//     programme: 'Intermediate Python',
//     lastTopic: 'Functions',
//   },
//   {
//     id: 3,
//     grade: 'Grade 7C',
//     programme: 'Advanced Python',
//     lastTopic: 'Object-Oriented Programming',
//   },
// ]

// const ClassroomPage: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState<string>('')

//   const filteredClassrooms = classrooms.filter(
//     (classroom) =>
//       classroom.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       classroom.programme.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(event.target.value)
//   }

//   const handleCreateClassroom = () => {
//     // TODO: Implement classroom creation logic
//     console.log('Create new classroom')
//   }

//   const handleStartLesson = (classroomId: number) => {
//     // TODO: Implement start lesson logic
//     console.log(`Start lesson for classroom ${classroomId}`)
//   }

//   return (
//     <div className='container mx-auto p-4'>
//       <h1 className='text-3xl font-bold mb-6'>My Classrooms</h1>

//       <div className='flex justify-between mb-6'>
//         <div className='relative w-64'>
//           <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
//           <Input
//             type='text'
//             placeholder='Search classrooms'
//             className='pl-8'
//             value={searchTerm}
//             onChange={handleSearch}
//           />
//         </div>
//         <Button onClick={handleCreateClassroom}>
//           <Plus className='mr-2 h-4 w-4' /> Create New Classroom
//         </Button>
//       </div>

//       <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//         {filteredClassrooms.map((classroom) => (
//           <Card key={classroom.id}>
//             <CardHeader>
//               <CardTitle>{classroom.grade}</CardTitle>
//               <CardDescription>{classroom.programme}</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <p>Last topic: {classroom.lastTopic}</p>
//             </CardContent>
//             <CardFooter>
//               <Button
//                 className='w-full'
//                 onClick={() => handleStartLesson(classroom.id)}
//               >
//                 <Play className='mr-2 h-4 w-4' /> Start Lesson
//               </Button>
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default ClassroomPage
'use client'
import React, { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CreateClassroomForm } from './CreateClassroomForm'
import { useToast } from '@/components/hooks/use-toast'

interface Classroom {
  _id: string
  name: string
  teacherId: string
  curriculumId: string
  curriculumName: string
  lastTopic: string
  createdAt: Date
  updatedAt: Date
}

const ClassroomPage: React.FC = () => {
  const { toast } = useToast()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch('/api/create-classroom')
        if (!response.ok) {
          throw new Error('Failed to fetch classrooms')
        }
        const data = await response.json()
        setClassrooms(data)
      } catch (error) {
        console.error('Error fetching classrooms:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClassrooms()
  }, [])

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.curriculumName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleCreateClassroom = async (
    data: Omit<Classroom, '_id' | 'createdAt' | 'updatedAt' | 'lastTopic'>
  ) => {
    try {
      const response = await fetch('/api/create-classroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create classroom')
      }

      const newClassroom = await response.json()
      setClassrooms([...classrooms, newClassroom])
      setIsDialogOpen(false)
      toast({
        title: 'Classroom created',
        description: 'New classroom has been successfully created.',
      })
    } catch (error) {
      console.error('Error creating classroom:', error)
      toast({
        title: 'Error',
        description: 'Failed to create classroom. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleStartLesson = (classroomId: string) => {
    // TODO: Implement start lesson logic
    console.log(`Start lesson for classroom ${classroomId}`)
  }

  if (isLoading) {
    return <div>Loading classrooms...</div>
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Create New Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-white'>
            <DialogHeader>
              <DialogTitle>Create New Classroom</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new classroom.
              </DialogDescription>
            </DialogHeader>
            <CreateClassroomForm onSubmit={handleCreateClassroom} />
          </DialogContent>
        </Dialog>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredClassrooms.map((classroom) => (
          <Card key={classroom._id}>
            <CardHeader>
              <CardTitle>{classroom.name}</CardTitle>
              <CardDescription>{classroom.curriculumName}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Last topic: {classroom.lastTopic}</p>
            </CardContent>
            <CardFooter>
              <Button
                className='w-full'
                onClick={() => handleStartLesson(classroom._id)}
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
