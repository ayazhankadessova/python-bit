import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Play, StopCircle } from 'lucide-react'

interface CodeExecutorProps {
  code: string
  onChange: (code: string) => void
  socket: any
  classroomId: string
  username: string
  role: 'teacher' | 'student'
}

const CodeExecutor = ({
  code,
  onChange,
  socket,
  classroomId,
  username,
  role,
}: CodeExecutorProps) => {
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [execId, setExecId] = useState('')

  useEffect(() => {
    if (!socket) return

    socket.on('execution-output', (data: { id: string; output: string }) => {
      if (data.id === execId) {
        setOutput((prev) => prev + data.output)
      }
    })

    socket.on('execution-error', (data: { id: string; error: string }) => {
      if (data.id === execId) {
        setError(data.error)
        setIsRunning(false)
      }
    })

    socket.on('execution-complete', (data: { id: string }) => {
      if (data.id === execId) {
        setIsRunning(false)
      }
    })

    return () => {
      socket.off('execution-output')
      socket.off('execution-error')
      socket.off('execution-complete')
    }
  }, [socket, execId])

  const handleRunCode = useCallback(() => {
    setIsRunning(true)
    setOutput('')
    setError('')
    const id = Math.random().toString(36).substring(7)
    setExecId(id)

    socket.emit('execute-code', {
      id,
      code,
      classroomId,
      username,
    })
  }, [code, socket, classroomId, username])

  const handleStopExecution = useCallback(() => {
    if (execId) {
      socket.emit('stop-execution', {
        id: execId,
        classroomId,
        username,
      })
      setIsRunning(false)
    }
  }, [execId, socket, classroomId, username])

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Write your Python code here...'
          className='font-mono min-h-[200px]'
        />
        <div className='flex gap-2'>
          <Button
            onClick={handleRunCode}
            disabled={isRunning || !code.trim()}
            className='w-24'
          >
            {isRunning ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Play className='w-4 h-4 mr-2' />
            )}
            Run
          </Button>
          {isRunning && (
            <Button
              onClick={handleStopExecution}
              variant='destructive'
              className='w-24'
            >
              <StopCircle className='w-4 h-4 mr-2' />
              Stop
            </Button>
          )}
        </div>
      </div>

      <Card className='p-4'>
        <h3 className='font-semibold mb-2'>Output</h3>
        <pre className='bg-zinc-950 text-white p-4 rounded-md overflow-auto max-h-[200px] font-mono whitespace-pre-wrap'>
          {output || 'No output yet...'}
        </pre>
      </Card>

      {error && (
        <Card className='p-4 border-red-500'>
          <h3 className='font-semibold mb-2 text-red-500'>Error</h3>
          <pre className='bg-red-50 text-red-500 p-4 rounded-md overflow-auto max-h-[200px] font-mono whitespace-pre-wrap'>
            {error}
          </pre>
        </Card>
      )}
    </div>
  )
}

export default CodeExecutor
