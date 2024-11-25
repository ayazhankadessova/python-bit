import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Play, StopCircle, Save } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import Split from 'split.js'
import './styles/CodeEditor.css' // Add this import

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

  const splitRef = useRef<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const outputContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorContainerRef.current && outputContainerRef.current) {
      splitRef.current = Split(
        [editorContainerRef.current, outputContainerRef.current],
        {
          sizes: [65, 35],
          minSize: [200, 100],
          direction: 'vertical',
          gutterSize: 6,
          snapOffset: 0,
        }
      )
    }

    return () => {
      if (splitRef.current) {
        splitRef.current.destroy()
      }
    }
  }, [])

  const handleSaveCode = () => {
    if (socket && role === 'student') {
      socket.emit('update-code', classroomId, username, code)
    }
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

  const editorBgColor = '#1e1e1e'

  return (
    <div className='flex flex-col h-[calc(100vh-theme(space.16))] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800'>
      <div ref={editorContainerRef} className='min-h-0 flex flex-col'>
        <div
          className='relative h-full'
          style={{ backgroundColor: editorBgColor }}
        >
          <CodeMirror
            value={code}
            height='100%'
            theme={vscodeDark}
            extensions={[python()]}
            onChange={onChange}
            style={{ fontSize: 14 }}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
          />
        </div>
        <div className='flex gap-2 p-2 bg-zinc-900 border-t border-zinc-800'>
          <Button
            onClick={handleRunCode}
            className='w-24 bg-emerald-600 hover:bg-emerald-700'
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
          {role === 'student' && (
            <Button onClick={handleSaveCode} variant='outline' className='w-24'>
              <Save className='w-4 h-4 mr-2' />
              Save
            </Button>
          )}
        </div>
      </div>

      <div
        ref={outputContainerRef}
        className='min-h-0 flex flex-col bg-zinc-900 p-4'
      >
        <div className='flex items-center gap-2 mb-3'>
          <div className='h-2 w-2 rounded-full bg-emerald-500'></div>
          <h3 className='font-medium text-zinc-200'>Output</h3>
        </div>

        <pre className='font-mono text-sm text-zinc-200 whitespace-pre-wrap h-full overflow-auto'>
          {output || 'No output yet...'}
        </pre>

        {error && (
          <div className='mt-4 border-l-4 border-red-500 bg-red-950/20 p-4 rounded'>
            <h3 className='font-medium text-red-400 mb-2'>Error</h3>
            <pre className='font-mono text-sm text-red-200 whitespace-pre-wrap'>
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default PythonCodeEditor
