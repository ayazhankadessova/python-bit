import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Play, StopCircle } from 'lucide-react'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  socket: any
  classroomId: string
  username: string
  role: 'teacher' | 'student'
}

const PythonCodeEditor = ({
  code,
  onChange,
  socket,
  classroomId,
  username,
  role,
}: CodeEditorProps) => {
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [execId, setExecId] = useState('')

  // Monaco editor options
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on' as const,
    suggestOnTriggerCharacters: true,
    tabSize: 4,
    rulers: [80],
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
  }

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

  const handleRunCode = () => {
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
  }

  const handleStopExecution = () => {
    if (execId) {
      socket.emit('stop-execution', {
        id: execId,
        classroomId,
        username,
      })
      setIsRunning(false)
    }
  }

  function handleEditorDidMount(editor: any) {
    // Enable Python syntax highlighting and suggestions
    editor.updateOptions({
      ...editorOptions,
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card className='p-4'>
        <div className='h-[400px] mb-4'>
          <Editor
            height='100%'
            defaultLanguage='python'
            value={code}
            onChange={(value) => onChange(value || '')}
            theme='vs-dark'
            options={editorOptions}
            onMount={handleEditorDidMount}
          />
        </div>
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
      </Card>

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

export default PythonCodeEditor
