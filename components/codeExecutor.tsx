// import React, { useState, useEffect, useRef } from 'react'
// import { Button } from '@/components/ui/button'
// import { Loader2, Play, StopCircle, Save } from 'lucide-react'
// import CodeMirror from '@uiw/react-codemirror'
// import { vscodeDark } from '@uiw/codemirror-theme-vscode'
// import { python } from '@codemirror/lang-python'
// import Split from 'split.js'
// import './styles/CodeEditor.css' // Add this import

// interface CodeEditorProps {
//   code: string
//   onChange: (code: string) => void
//   socket: any
//   classroomId: string
//   username: string
//   role: 'teacher' | 'student'
// }

// const PythonCodeEditor = ({
//   code,
//   onChange,
//   socket,
//   classroomId,
//   username,
//   role,
// }: CodeEditorProps) => {
//   const [output, setOutput] = useState('')
//   const [error, setError] = useState('')
//   const [isRunning, setIsRunning] = useState(false)
//   const [execId, setExecId] = useState('')

//   const splitRef = useRef<any>(null)
//   const editorContainerRef = useRef<HTMLDivElement>(null)
//   const outputContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (editorContainerRef.current && outputContainerRef.current) {
//       splitRef.current = Split(
//         [editorContainerRef.current, outputContainerRef.current],
//         {
//           sizes: [65, 35],
//           minSize: [200, 100],
//           direction: 'vertical',
//           gutterSize: 6,
//           snapOffset: 0,
//         }
//       )
//     }

//     return () => {
//       if (splitRef.current) {
//         splitRef.current.destroy()
//       }
//     }
//   }, [])

//   const handleSaveCode = () => {
//     if (socket && role === 'student') {
//       socket.emit('update-code', classroomId, username, code)
//     }
//   }

//   useEffect(() => {
//     if (!socket) return

//     socket.on('execution-output', (data: { id: string; output: string }) => {
//       if (data.id === execId) {
//         setOutput((prev) => prev + data.output)
//       }
//     })

//     socket.on('execution-error', (data: { id: string; error: string }) => {
//       if (data.id === execId) {
//         setError(data.error)
//         setIsRunning(false)
//       }
//     })

//     socket.on('execution-complete', (data: { id: string }) => {
//       if (data.id === execId) {
//         setIsRunning(false)
//       }
//     })

//     return () => {
//       socket.off('execution-output')
//       socket.off('execution-error')
//       socket.off('execution-complete')
//     }
//   }, [socket, execId])

//   const handleRunCode = () => {
//     setIsRunning(true)
//     setOutput('')
//     setError('')
//     const id = Math.random().toString(36).substring(7)
//     setExecId(id)

//     socket.emit('execute-code', {
//       id,
//       code,
//       classroomId,
//       username,
//     })
//   }

//   const handleStopExecution = () => {
//     if (execId) {
//       socket.emit('stop-execution', {
//         id: execId,
//         classroomId,
//         username,
//       })
//       setIsRunning(false)
//     }
//   }

//   const editorBgColor = '#1e1e1e'

//   return (
//     <div className='flex flex-col h-[calc(100vh-theme(space.16))] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800'>
//       <div ref={editorContainerRef} className='min-h-0 flex flex-col'>
//         <div
//           className='relative h-full'
//           style={{ backgroundColor: editorBgColor }}
//         >
//           <CodeMirror
//             value={code}
//             height='100%'
//             theme={vscodeDark}
//             extensions={[python()]}
//             onChange={onChange}
//             style={{ fontSize: 14 }}
//             basicSetup={{
//               lineNumbers: true,
//               highlightActiveLineGutter: true,
//               highlightSpecialChars: true,
//               history: true,
//               foldGutter: true,
//               drawSelection: true,
//               dropCursor: true,
//               allowMultipleSelections: true,
//               indentOnInput: true,
//               syntaxHighlighting: true,
//               bracketMatching: true,
//               closeBrackets: true,
//               autocompletion: true,
//               rectangularSelection: true,
//               crosshairCursor: true,
//               highlightActiveLine: true,
//               highlightSelectionMatches: true,
//               closeBracketsKeymap: true,
//               defaultKeymap: true,
//               searchKeymap: true,
//               historyKeymap: true,
//               foldKeymap: true,
//               completionKeymap: true,
//               lintKeymap: true,
//             }}
//           />
//         </div>
//         <div className='flex gap-2 p-2 bg-zinc-900 border-t border-zinc-800'>
//           <Button
//             onClick={handleRunCode}
//             className='w-24 bg-emerald-600 hover:bg-emerald-700'
//           >
//             {isRunning ? (
//               <Loader2 className='w-4 h-4 animate-spin' />
//             ) : (
//               <Play className='w-4 h-4 mr-2' />
//             )}
//             Run
//           </Button>
//           {isRunning && (
//             <Button
//               onClick={handleStopExecution}
//               variant='destructive'
//               className='w-24'
//             >
//               <StopCircle className='w-4 h-4 mr-2' />
//               Stop
//             </Button>
//           )}
//           {role === 'student' && (
//             <Button onClick={handleSaveCode} variant='outline' className='w-24'>
//               <Save className='w-4 h-4 mr-2' />
//               Save
//             </Button>
//           )}
//         </div>
//       </div>

//       <div
//         ref={outputContainerRef}
//         className='min-h-0 flex flex-col bg-zinc-900 p-4'
//       >
//         <div className='flex items-center gap-2 mb-3'>
//           <div className='h-2 w-2 rounded-full bg-emerald-500'></div>
//           <h3 className='font-medium text-zinc-200'>Output</h3>
//         </div>

//         <pre className='font-mono text-sm text-zinc-200 whitespace-pre-wrap h-full overflow-auto'>
//           {output || 'No output yet...'}
//         </pre>

//         {error && (
//           <div className='mt-4 border-l-4 border-red-500 bg-red-950/20 p-4 rounded'>
//             <h3 className='font-medium text-red-400 mb-2'>Error</h3>
//             <pre className='font-mono text-sm text-red-200 whitespace-pre-wrap'>
//               {error}
//             </pre>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default PythonCodeEditor
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2 } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'

interface CodeEditorProps {
  initialCode: string
  expectedOutput?: string
}

const PythonCodeEditor = ({ initialCode, expectedOutput }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCode = async () => {
    setIsExecuting(true)
    setError(null)
    setOutput('')

    try {
      const response = await fetch('/api/simple-execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute code')
      }

      const executionOutput = data.output.trim()
      setOutput(executionOutput)

      if (expectedOutput) {
        setIsCorrect(executionOutput === expectedOutput.trim())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsCorrect(false)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className='rounded-lg overflow-hidden border border-zinc-800'>
      {/* Code Editor */}
      <div className='bg-zinc-950 p-4'>
        <CodeMirror
          value={code}
          height='200px'
          theme={vscodeDark}
          extensions={[python()]}
          onChange={(value) => setCode(value)}
        />
        <div className='mt-4'>
          <Button
            onClick={runCode}
            className='bg-emerald-600 hover:bg-emerald-700'
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Play className='w-4 h-4 mr-2' />
            )}
            {isExecuting ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Output Section */}
      <div className='bg-zinc-900 p-4'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='h-2 w-2 rounded-full bg-emerald-500'></div>
          <h3 className='font-medium text-zinc-200'>Output</h3>
        </div>

        {error ? (
          <pre className='font-mono text-sm text-red-400 whitespace-pre-wrap'>
            {error}
          </pre>
        ) : (
          <pre className='font-mono text-sm text-zinc-200 whitespace-pre-wrap'>
            {output || 'No output yet...'}
          </pre>
        )}

        {expectedOutput && isCorrect !== null && !error && (
          <div
            className={`mt-4 p-2 rounded ${
              isCorrect
                ? 'bg-emerald-950/20 text-emerald-400'
                : 'bg-red-950/20 text-red-400'
            }`}
          >
            {isCorrect ? '✅ Correct!' : '❌ Try again!'}
          </div>
        )}
      </div>
    </div>
  )
}

export default PythonCodeEditor