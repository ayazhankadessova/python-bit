import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Socket } from 'socket.io-client'
import { ShareLink } from '@/components/share-link'
import { useToast } from '@/components/hooks/use-toast'
import { User } from '@/models/types'
import { CircleHelp } from 'lucide-react'

interface SessionViewProps {
  classroomId: string
  onEndSession: () => void
  socket: Socket | null
  role: 'teacher' | 'student'
  username: string | null
}

export function SessionView({
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
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
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
          if (selectedStudent && selectedStudent.username === data.username) {
            setStudentCode(data.code)
          }
          if (role === 'student' && username === data.username) {
            setStudentCode(data.code)
          }
        }
      )

      socket.on('participant-left', (leftUsername: string) => {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.username !== leftUsername)
        )
        if (selectedStudent && selectedStudent.username === leftUsername) {
          setSelectedStudent(null)
        }
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
  }, [socket, role, toast, onEndSession, selectedStudent, username])

  const handleSendCode = () => {
    if (socket) {
      if (selectedStudent) {
        socket.emit(
          'update-code',
          classroomId,
          selectedStudent.username,
          studentCode
        )
      } else {
        socket.emit('update-starter-code', classroomId, starterCode)
        toast({
          title: 'Code Sent',
          description: 'Code sent to all students.',
        })
      }
    }
  }

  const handleUpdateCode = () => {
    if (socket && role === 'student') {
      socket.emit('update-code', classroomId, username, studentCode)
    }
  }

  const handleStudentSelect = (student: User | null) => {
    setSelectedStudent(student)
    if (student) {
      setStudentCode(student.code || '')
    }
  }

  return (
    <div className='flex h-screen'>
      <div className='w-1/3 p-4 border-r'>
        <h2 className='text-2xl font-bold mb-4'>
          {role === 'teacher'
            ? `${username}'s Classroom`
            : `${username}'s Workspace`}
        </h2>
        {role === 'teacher' && (
          <Card
            className={`mb-4 cursor-pointer ${
              !selectedStudent ? 'border-blue-500' : ''
            }`}
            onClick={() => handleStudentSelect(null)}
          >
            <CardHeader>
              <CardTitle className='flex items-center'>
                {username} (Teacher)
                <span className='ml-2 w-3 h-3 rounded-full bg-purple-500' />
              </CardTitle>
            </CardHeader>
          </Card>
        )}
        <h3 className='text-xl font-semibold mb-2'>Students</h3>
        {students.map((student) => (
          <Card
            key={student.username}
            className={`mb-2 cursor-pointer ${
              selectedStudent?.username === student.username
                ? 'border-blue-500'
                : ''
            }`}
            onClick={() => role === 'teacher' && handleStudentSelect(student)}
          >
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
              value={selectedStudent ? studentCode : starterCode}
              onChange={(e) =>
                selectedStudent
                  ? setStudentCode(e.target.value)
                  : setStarterCode(e.target.value)
              }
              placeholder='Write your Python code here'
              className='h-1/2 mb-4'
            />
            <Button onClick={handleSendCode}>
              {selectedStudent
                ? `Send Code to ${selectedStudent.username}`
                : 'Send Code to All Students'}
            </Button>
          </>
        )}
        {role === 'student' && (
          <>
            <div className='flex justify-end gap-2 mb-4'>
              <Button className='bg-zinc-950'>
                Ask for Help
                <CircleHelp className='ml-3' />
              </Button>
              <Button onClick={onEndSession} variant='destructive'>
                Leave Room
              </Button>
            </div>
            <Textarea
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder='Write your solution here'
              className='h-1/2 mb-4'
            />
            <Button onClick={handleUpdateCode}>Update Code</Button>
          </>
        )}
      </div>
    </div>
  )
}
