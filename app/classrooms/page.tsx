'use client'
import React, { useState, useEffect, useCallback } from 'react'
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
import { SessionView } from '@/components/session-view'
import io from 'socket.io-client'

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
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [socket, setSocket] = useState<any>(null)

  //   const initializeSocket = useCallback(async () => {
  //     await fetch('/api/socket')
  //     const newSocket = io()
  //     setSocket(newSocket)

  //     return () => newSocket.disconnect()
  //   }, [])

  //   useEffect(() => {
  //     initializeSocket()
  //   }, [initializeSocket])

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch('/api/classroom')
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

  //   useEffect(() => {
  //     if (socket) {
  //       socket.on('receive-message', (data: any) => {
  //         console.log('Received message:', data)
  //         // Handle the received message
  //       })
  //     }
  //   }, [socket])

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
      const response = await fetch('/api/classroom', {
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

  const handleStartLesson = async (classroomId: string) => {
    setActiveSession(classroomId)
    if (socket) {
      socket.emit('join-room', classroomId)
    }
  }

  const handleEndSession = async () => {
    setActiveSession(null)
    if (socket) {
      socket.emit('leave-room', activeSession)
    }
    toast({
      title: 'Session ended',
      description: 'You have successfully ended the session.',
    })
  }

  if (isLoading) {
    return <div>Loading classrooms...</div>
  }

  if (activeSession) {
    const classroom = classrooms.find((c) => c._id === activeSession)
    return (
      <SessionView
        teacherName='Ayazhan'
        classroomId={activeSession}
        onEndSession={handleEndSession}
        socket={socket}
      />
    )
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
