'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Socket } from 'socket.io-client'
import { CopyIcon, CheckIcon, Share2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useToast } from '@/components/hooks/use-toast'

interface Student {
  id: string
  name: string
  code: string
  status: 'on-track' | 'behind'
}

interface SessionViewProps {
  teacherName: string
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
}

export function SessionView({
  teacherName,
  classroomId,
  onEndSession,
  socket,
}: SessionViewProps) {
  const [starterCode, setStarterCode] = useState('')
  const [teacherCode, setTeacherCode] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [inviteLink, setInviteLink] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (socket) {
      // Set up WebSocket listeners
      socket.on('student-joined', (student: Student) => {
        setStudents((prev) => [...prev, student])
      })

      socket.on('student-left', (studentId: string) => {
        setStudents((prev) => prev.filter((s) => s.id !== studentId))
      })

      socket.on(
        'student-code-update',
        ({ studentId, code }: { studentId: string; code: string }) => {
          setStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, code } : s))
          )
        }
      )

      socket.on(
        'student-status-update',
        ({
          studentId,
          status,
        }: {
          studentId: string
          status: 'on-track' | 'behind'
        }) => {
          setStudents((prev) =>
            prev.map((s) => (s.id === studentId ? { ...s, status } : s))
          )
        }
      )

      // Fetch initial session data
      socket.emit(
        'get-session-data',
        classroomId,
        (data: { starterCode: string; students: Student[] }) => {
          setStarterCode(data.starterCode)
          setStudents(data.students)
        }
      )
    }

    return () => {
      if (socket) {
        socket.off('student-joined')
        socket.off('student-left')
        socket.off('student-code-update')
        socket.off('student-status-update')
      }
    }
  }, [socket, classroomId])

  const handleSendCode = () => {
    if (socket) {
      socket.emit('send-teacher-code', { classroomId, code: teacherCode })
    }
  }

  const handleGenerateInviteLink = async () => {
    try {
      const response = await fetch(`/api/classroom/${classroomId}/invite`, {
        method: 'PUT',
      })
      if (!response.ok) {
        throw new Error('Failed to generate invite link')
      }
      const { inviteLink } = await response.json()
      setInviteLink(inviteLink)
      toast({
        title: 'Invite link generated',
        description: 'The invite link has been created.',
      })
    } catch (error) {
      console.error('Error generating invite link:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate invite link. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: 'Link copied',
      description: 'The invite link has been copied to clipboard.',
    })
  }

  return (
    <div className='flex h-screen'>
      <div className='w-1/3 p-4 border-r'>
        <h2 className='text-2xl font-bold mb-4'>{teacherName}'s Classroom</h2>
        <Textarea
          value={starterCode}
          onChange={(e) => setStarterCode(e.target.value)}
          placeholder='Starter code'
          className='mb-4'
        />
        <h3 className='text-xl font-semibold mb-2'>Students</h3>
        {students.map((student) => (
          <Card key={student.id} className='mb-2'>
            <CardHeader>
              <CardTitle className='flex items-center'>
                {student.name}
                <span
                  className={`ml-2 w-3 h-3 rounded-full ${
                    student.status === 'on-track'
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className='text-sm'>{student.code}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='w-2/3 p-4'>
        <div className='flex justify-between mb-4'>
          <Popover>
            <PopoverTrigger asChild>
              <Button onClick={handleGenerateInviteLink}>
                <Share2 className='mr-2 h-3 w-3' />
                <span className='hidden md:block'>Invite</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align='start' className='w-[200px] md:w-[300px]'>
              <div className='flex flex-col space-y-2 text-left sm:text-left'>
                <h4 className='font-semibold'>Share this classroom</h4>
                <p className='text-sm text-muted-foreground'>
                  Use the link below to invite students
                </p>
              </div>
              <div className='flex flex-nowrap mt-4 gap-2'>
                <div className='grid flex-1 gap-2'>
                  <Label htmlFor='link' className='sr-only'>
                    Link
                  </Label>
                  <Input
                    id='link'
                    value={inviteLink}
                    readOnly
                    className='h-9'
                    type='url'
                  />
                </div>
                <Button
                  type='button'
                  size='sm'
                  className='px-3 inline-flex items-center justify-center'
                  variant='secondary'
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className='h-4 w-4 mr-2' />
                      <span className='hidden md:block'> Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className='h-4 w-4 mr-2' />
                      <span className='hidden md:block'>Copy Link</span>
                    </>
                  )}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={onEndSession} variant='destructive'>
            End Session
          </Button>
        </div>
        <Textarea
          value={teacherCode}
          onChange={(e) => setTeacherCode(e.target.value)}
          placeholder='Write your Python code here'
          className='h-1/2 mb-4'
        />
        <Button onClick={handleSendCode}>Send Code</Button>
      </div>
    </div>
  )
}
