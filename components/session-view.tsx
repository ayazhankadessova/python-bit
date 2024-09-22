'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Socket } from 'socket.io-client'
import { ShareLink } from '@/components/share-link'
import { useToast } from '@/components/hooks/use-toast'
import { User } from '@/models/types'

interface SessionViewProps {
  userName: string
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
  role: 'teacher' | 'student'
  username: string
}

export function SessionView({
  userName,
  classroomId,
  onEndSession,
  socket,
  role,
  username,
}: SessionViewProps) {
  const { toast } = useToast()
  const [starterCode, setStarterCode] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [students, setStudents] = useState<User[]>([])
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${classroomId}`

  useEffect(() => {
    if (socket) {
      socket.on(
        'session-data',
        (data: { starterCode: string; students: User[] }) => {
          setStarterCode(data.starterCode)
          setStudents(data.students)
          if (role === 'student') {
            setStudentCode(data.starterCode)
          }
        }
      )

      socket.on(
        'update-participants',
        (updatedParticipants: { students: User[] }) => {
          setStudents(updatedParticipants.students)
        }
      )

      socket.on(
        'starter-code-updated',
        (data: { starterCode: string; students: User[] }) => {
          setStarterCode(data.starterCode)
          setStudents(data.students)
          if (role === 'student') {
            setStudentCode(data.starterCode)
          }
          toast({
            title: 'Starter Code Updated',
            description: 'The teacher has updated the starter code.',
          })
        }
      )

      socket.on(
        'student-code-updated',
        (data: { username: string; code: string }) => {
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student.username === data.username
                ? { ...student, code: data.code }
                : student
            )
          )
        }
      )

      socket.on('participant-left', (leftUsername: string) => {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.username !== leftUsername)
        )
      })

      socket.on('session-ended', () => {
        toast({
          title: 'Session Ended',
          description: 'The teacher has ended the session.',
        })
        onEndSession()
      })

      return () => {
        socket.off('session-data')
        socket.off('update-participants')
        socket.off('starter-code-updated')
        socket.off('student-code-updated')
        socket.off('participant-left')
        socket.off('session-ended')
      }
    }
  }, [socket, role, toast, onEndSession])

  const handleSendCode = () => {
    if (socket) {
      socket.emit('update-starter-code', classroomId, starterCode)
    }
  }

  const handleSubmitCode = () => {
    if (socket && role === 'student') {
      socket.emit('submit-code', classroomId, username, studentCode)
    }
  }

  return (
    <div className='flex h-screen'>
      <div className='w-1/3 p-4 border-r'>
        <h2 className='text-2xl font-bold mb-4'>
          {role === 'teacher'
            ? `${userName}'s Classroom`
            : `${userName}'s Workspace`}
        </h2>
        <h3 className='text-xl font-semibold mb-2'>Students</h3>
        {students.map((student) => (
          <Card key={student.username} className='mb-2'>
            <CardHeader>
              <CardTitle className='flex items-center'>
                {student.username}
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
        {role === 'teacher' && (
          <>
            <div className='flex justify-between mb-4'>
              <ShareLink fullLink={inviteLink} />
              <Button onClick={onEndSession} variant='destructive'>
                End Session
              </Button>
            </div>
            <Textarea
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              placeholder='Write your Python code here'
              className='h-1/2 mb-4'
            />
            <Button onClick={handleSendCode}>Send Code to Students</Button>
          </>
        )}
        {role === 'student' && (
          <>
            <Textarea
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder='Write your solution here'
              className='h-1/2 mb-4'
            />
            <Button onClick={handleSubmitCode}>Submit Code</Button>
          </>
        )}
      </div>
    </div>
  )
}
