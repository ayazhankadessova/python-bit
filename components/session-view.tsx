import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Socket } from 'socket.io-client'

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

  const handleInvite = () => {
    if (socket) {
      socket.emit('generate-invite-link', classroomId, (link: string) => {
        navigator.clipboard
          .writeText(link)
          .then(() => alert('Invite link copied to clipboard!'))
          .catch((err) => console.error('Failed to copy: ', err))
      })
    }
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
          <Button onClick={handleInvite}>Invite</Button>
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
