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
  code?: string
}

interface SessionViewProps {
  teacherName: string
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
  role: 'teacher' | 'student'
}

export function SessionView({
  teacherName,
  classroomId,
  onEndSession,
  socket,
  role,
}: SessionViewProps) {
  const { toast } = useToast()
  const [starterCode, setStarterCode] = useState('')
  const [teacherCode, setTeacherCode] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [inviteLink, setInviteLink] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (socket) {
      socket.on(
        'session-data',
        (data: { starterCode: string; students: Student[] }) => {
          setStarterCode(data.starterCode)
          setStudents(data.students)
          if (role === 'student') {
            setTeacherCode(data.starterCode)
          }
        }
      )

      // socket.on(
      //   'get-session-data',
      //   (data: { starterCode: string; students: Student[] }) => {
      //     console.log('student wants to get init data')
      //     setStarterCode(data.starterCode)
      //     setStudents(data.students)
      //   }
      // )

      socket.on(
        'starter-code-updated',
        (data: { starterCode: string; students: Student[] }) => {
          setStarterCode(data.starterCode)
          setStudents(data.students)
          if (role === 'student') {
            setTeacherCode(data.starterCode)
          }
          toast({
            title: 'Starter Code Updated',
            description: 'The teacher has updated the starter code.',
          })
        }
      )

      // Request initial data
      socket.emit('get-session-data', classroomId)
    }

    return () => {
      if (socket) {
        socket.off('update-participants')
        socket.off('get-session-data')
        socket.off('starter-code-updated')
      }
    }
  }, [socket, classroomId, role, toast])

  const handleSendCode = () => {
    if (socket) {
      socket.emit('update-starter-code', classroomId, teacherCode)
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
        <h2 className='text-2xl font-bold mb-4'>
          {role === 'teacher' ? `${teacherName}'s Classroom` : 'Classroom'}
        </h2>
        {role === 'teacher' && (
          <Textarea
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            placeholder='Starter code'
            className='mb-4'
          />
        )}
        <h3 className='text-xl font-semibold mb-2'>Students</h3>
        {students.map((student) => (
          <Card key={student.id} className='mb-2'>
            <CardHeader>
              <CardTitle className='flex items-center'>
                {student.id}
                <span className='ml-2 w-3 h-3 rounded-full bg-green-500' />
              </CardTitle>
            </CardHeader>
            {role === 'teacher' && student.code && (
              <CardContent>
                <pre className='text-sm'>{student.code}</pre>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      <div className='w-2/3 p-4'>
        {role == 'teacher' && (
          <>
            <div className='flex justify-between mb-4'>
              <Button onClick={handleGenerateInviteLink}>
                Generate Invite Link
              </Button>
              <Button onClick={onEndSession} variant='destructive'>
                End Session
              </Button>
            </div>
            {inviteLink && (
              <div className='mb-4'>
                <Input value={inviteLink} readOnly />
                <Button onClick={handleCopy}>
                  {isCopied ? 'Copied!' : 'Copy Invite Link'}
                </Button>
              </div>
            )}
          </>
        )}
        <Textarea
          value={teacherCode}
          onChange={(e) => setTeacherCode(e.target.value)}
          placeholder={
            role === 'teacher'
              ? 'Write your Python code here'
              : 'Write your solution here'
          }
          className='h-1/2 mb-4'
        />

        {role == 'teacher' ? (
          <Button onClick={handleSendCode}>Send Code to Students</Button>
        ) : (
          <Button>Submit Code</Button>
        )}
      </div>
    </div>
  )
}
