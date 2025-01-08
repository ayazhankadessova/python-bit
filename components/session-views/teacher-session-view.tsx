// TeacherSessionView.tsx
import React, { useState, useEffect } from 'react'
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  getDoc,
  query,
  orderBy,
  where,
  limit,

  serverTimestamp,
  UpdateData
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { useToast } from '@/hooks/use-toast'
import { Play, StopCircle, Send, RefreshCw } from 'lucide-react'
import { WeekSelector } from './WeekSelector'
import type { LiveSession, SessionStudent, ExecutionResult } from '@/types/classrooms/live-session'
import { Problem } from '@/types/utils'

interface TeacherSessionViewProps {
  classroomId: string
  onEndSession: () => void
  sessionId: string
}

export function TeacherSessionView({
  classroomId,
  sessionId,
  onEndSession,
}: TeacherSessionViewProps): JSX.Element {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [studentCode, setStudentCode] = useState<string>('')
  const [teacherCode, setTeacherCode] = useState<string>('')
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<
    string | null
  >(null)
  const [students, setStudents] = useState<
    Array<{ username: string } & SessionStudent>
  >([])
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionRef = collection(
      fireStore,
      `classrooms/${classroomId}/sessions`
    )
    const q = query(
      sessionRef,
      where('endedAt', '==', null),
      orderBy('startedAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsLoading(false)

        if (!snapshot.empty) {
          const sessionData = snapshot.docs[0].data() as Omit<LiveSession, 'id'>
          const session: LiveSession = {
            id: snapshot.docs[0].id,
            ...sessionData,
          }
          setCurrentSession(session)
        } else {
          setCurrentSession(null)
        }
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [classroomId])

  useEffect(() => {
    if (!currentSession) return

    const unsubscribe = onSnapshot(
      doc(fireStore, `classrooms/${classroomId}/sessions`, currentSession.id),
      (snapshot) => {
        const data = snapshot.data() as LiveSession
        setStudents(
          Object.entries(data.students).map(([username, info]) => ({
            username,
            ...info,
          }))
        )

        if (selectedStudentUsername && data.students[selectedStudentUsername]) {
          setTeacherCode(data.students[selectedStudentUsername].code)
        }
      }
    )

    return () => unsubscribe()
  }, [classroomId, currentSession?.id, selectedStudentUsername])

  const handleStudentSelect = async (
    studentUsername: string | null
  ): Promise<void> => {
    setSelectedStudentUsername(studentUsername)
    if (!studentUsername) {
      setTeacherCode(currentProblem?.starterCode || '')
    } else if (currentSession) {
      const sessionDoc = await getDoc(
        doc(fireStore, `classrooms/${classroomId}/sessions`, currentSession.id)
      )
      const data = sessionDoc.data() as LiveSession
      if (data.students[studentUsername]) {
        setStudentCode(data.students[studentUsername].code)
      }
    }
  }

  const handleRunCode = async (): Promise<void> => {
    if (!teacherCode && !studentCode) return
    setIsRunning(true)
    setOutput('')

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: teacherCode,
        }),
      })

      const result = (await response.json()) as ExecutionResult
      setOutput(result.success ? result.output || '' : `Error: ${result.error}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      setOutput(`Error: ${errorMessage}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSendCode = async (): Promise<void> => {
    if (!currentSession) return

    try {
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions`,
        currentSession.id
      )

      if (selectedStudentUsername) {
        await updateDoc(sessionRef, {
          [`students.${selectedStudentUsername}.code`]: teacherCode,
          [`students.${selectedStudentUsername}.lastUpdated`]:
            serverTimestamp(),
        })

        toast({
          title: 'Code Sent',
          description: `Code sent to ${selectedStudentUsername}`,
        })
      } else {
        // Use UpdateData type from Firestore
        const updates: UpdateData<LiveSession> = {}

        students.forEach((student) => {
          updates[`students.${student.username}.code`] = teacherCode
          updates[`students.${student.username}.lastUpdated`] =
            serverTimestamp()
        })

        await updateDoc(sessionRef, updates)

        toast({
          title: 'Code Broadcast',
          description: 'Code sent to all students',
        })
      }
    } catch (error) {
      console.error('Error sending code:', error)
      toast({
        title: 'Error',
        description: 'Failed to send code',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='h-screen flex'>
      {/* Left Panel: Students List */}
      <div className='w-1/4 border-r p-4 bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]'>
        <div className='mb-4'>
          <WeekSelector
            selectedWeek={currentSession?.weekNumber || 1}
            totalWeeks={5} // Replace with actual total weeks
            onSelectWeek={() => {}} // Add week selection logic
          />
        </div>

        <div className='space-y-2'>
          <h3 className='font-semibold'>Connected Students</h3>
          {students.map((student) => (
            <Card
              key={student.username}
              className={`cursor-pointer hover:bg-accent ${
                selectedStudentUsername === student.username
                  ? 'border-primary'
                  : ''
              }`}
              onClick={() => handleStudentSelect(student.username)}
            >
              <CardHeader>
                <CardTitle className='text-sm'>{student.username}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Center: Code Editor */}
      <div className='flex-1 flex flex-col p-4'>
        <div className='mb-4'>
          <h2 className='text-xl font-bold'>
            {selectedStudentUsername
              ? `Editing code for ${selectedStudentUsername}`
              : 'Broadcasting to all students'}
          </h2>
        </div>

        <CodeMirror
          value={selectedStudentUsername ? studentCode :teacherCode}
          height='calc(100vh - 300px)'
          theme={vscodeDark}
          extensions={[python()]}
          onChange={setTeacherCode}
        />

        <div className='mt-4 space-x-2'>
          <Button onClick={handleRunCode} disabled={isRunning}>
            {isRunning ? (
              <StopCircle className='mr-2 h-4 w-4' />
            ) : (
              <Play className='mr-2 h-4 w-4' />
            )}
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          <Button onClick={handleSendCode}>
            <Send className='mr-2 h-4 w-4' />
            {selectedStudentUsername
              ? `Send to ${selectedStudentUsername}`
              : 'Send to All'}
          </Button>
        </div>

        {output && (
          <div className='mt-4 p-4 bg-black text-white font-mono rounded-md'>
            <pre>{output}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
