'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Play, Link } from 'lucide-react'
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
  inviteLink: string
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

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.curriculumName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleCreateClassroom = async (
    data: Omit<
      Classroom,
      '_id' | 'createdAt' | 'updatedAt' | 'lastTopic' | 'inviteLink'
    >
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
    try {
      const newSocket = io('http://localhost:3000')
      setSocket(newSocket)

      newSocket.on('connect', () => {
        console.log('Connected to socket server')
        newSocket.emit('join-room', classroomId, 'teacher-id', true)
        setActiveSession(classroomId)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the classroom. Please try again.',
          variant: 'destructive',
        })
      })
    } catch (error) {
      console.error('Error starting lesson:', error)
      toast({
        title: 'Error',
        description: 'Failed to start the lesson. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleEndSession = async () => {
    if (socket && activeSession) {
      socket.emit('leave-room', activeSession, 'teacher-id')
      socket.disconnect()
      setSocket(null)
    }
    setActiveSession(null)
    toast({
      title: 'Session ended',
      description: 'You have successfully ended the session.',
    })
  }

  const handleGenerateInviteLink = async (classroomId: string) => {
    try {
      const response = await fetch(`/api/classroom/${classroomId}/invite`, {
        method: 'PUT',
      })
      if (!response.ok) {
        throw new Error('Failed to generate invite link')
      }
      const { inviteLink } = await response.json()
      setClassrooms(
        classrooms.map((c) =>
          c._id === classroomId ? { ...c, inviteLink } : c
        )
      )
      toast({
        title: 'Invite link generated',
        description:
          'The invite link has been created and copied to clipboard.',
      })
      navigator.clipboard.writeText(inviteLink)
    } catch (error) {
      console.error('Error generating invite link:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate invite link. Please try again.',
        variant: 'destructive',
      })
    }
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
            <CardFooter className='flex justify-between'>
              <Button onClick={() => handleStartLesson(classroom._id)}>
                <Play className='mr-2 h-4 w-4' /> Start Lesson
              </Button>
              <Button
                variant='outline'
                onClick={() => handleGenerateInviteLink(classroom._id)}
              >
                <Link className='mr-2 h-4 w-4' /> Invite Link
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClassroomPage
