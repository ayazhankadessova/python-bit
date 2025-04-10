import React, { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { Button } from '@/components/ui/button'
import {
  Play,
  Send,
  Code2,
  Loader2,
  RefreshCw,
  RotateCcw,
  CloudUpload,
} from 'lucide-react'
import {
  ResizableHandle,
  ResizablePanelGroup,
  ResizablePanel,
} from '@/components/ui/resizable'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ThemeButtons from '@/components/code-editors/theme-buttons'
import { getTheme } from '@/lib/general/codeEditors'
import { ActiveStudent } from '@/types/classrooms/live-session'

interface PythonEditorProps {
  initialCode: string
  onCodeChange: (code: string) => void
  onRunCode: (code: string) => Promise<void>
  onSubmitCode?: (code: string) => Promise<void>
  isTeacher?: boolean
  onSendCode?: (code: string, student?: ActiveStudent) => Promise<void>
  onUpdateCode?: () => Promise<void>
  selectedStudent?: ActiveStudent | null
  output: string
  error: string | null
  isCorrect?: boolean | null
  title?: string
}

export function PythonEditor({
  initialCode,
  onCodeChange,
  onRunCode,
  onSubmitCode,
  isTeacher = false,
  onSendCode,
  onUpdateCode,
  selectedStudent,
  output,
  error,
  isCorrect,
  title = 'Python Editor',
}: PythonEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [theme, setTheme] = useState<'dark' | 'vscode'>('vscode')
  const [isExecuting, setIsExecuting] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const handleUpdateCode = async () => {
    if (!onUpdateCode) return
    setIsUpdating(true)
    try {
      await onUpdateCode()
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    onCodeChange(value)
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setIsExecuting(true)
    try {
      await onRunCode(code)
    } finally {
      setIsRunning(false)
      setIsExecuting(false)
    }
  }

  const handleSubmitCode = async () => {
    if (!onSubmitCode) return
    setIsSubmitting(true)
    setIsExecuting(true)
    try {
      await onSubmitCode(code)
    } finally {
      setIsSubmitting(false)
      setIsExecuting(false)
    }
  }

  const handleSendCode = async () => {
    if (!onSendCode) return
    try {
      await onSendCode(code, selectedStudent || undefined)
    } catch (error) {
      console.error('Error sending code:', error)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    onCodeChange(initialCode)
    setIsResetDialogOpen(false)
  }

  const isDarkTheme = theme === 'dark' || theme === 'vscode'

  useEffect(() => {
    if (initialCode && !isExecuting) {
      setCode(initialCode)
    }
  }, [initialCode, isExecuting])

  return (
    <>
      <div className='flex flex-col h-full rounded-xl overflow-hidden border'>
        {/* Header */}
        <div
          className={`w-full px-4 py-3 flex justify-between items-center flex-none 
          ${isDarkTheme ? 'bg-zinc-900' : 'bg-white'}
          border-b ${isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'}`}
        >
          <div className='flex items-center gap-2'>
            <Code2
              className={`w-4 h-4 ${
                isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            />
            <span
              className={`text-sm ${
                isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              {title}
            </span>
          </div>
          <ThemeButtons theme={theme} setTheme={setTheme} />
        </div>

        {/* Resizable Panel Group */}
        <ResizablePanelGroup
          direction='vertical'
          className={`flex-auto ${isDarkTheme ? 'bg-zinc-950' : 'bg-gray-50'}`}
        >
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className='h-full'>
              <CodeMirror
                value={code}
                height='100%'
                theme={getTheme(theme)}
                extensions={[python()]}
                onChange={handleCodeChange}
                className='h-full'
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
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
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Output and Actions Panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className='flex flex-col h-full'>
              {/* Action Buttons */}
              <div
                className={`p-4 border-b ${
                  isDarkTheme
                    ? 'border-zinc-800 bg-zinc-900'
                    : 'border-zinc-200 bg-white'
                } flex gap-2`}
              >
                <Button
                  onClick={handleRunCode}
                  // className='bg-emerald-600 hover:bg-emerald-700 text-white'
                  disabled={isExecuting}
                >
                  {isRunning ? (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  ) : (
                    <Play className='w-4 h-4 mr-2' />
                  )}
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>

                {onSubmitCode && (
                  <Button
                    onClick={handleSubmitCode}
                    disabled={isExecuting}
                    variant='whiteGray'
                  >
                    {isSubmitting ? (
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    ) : (
                      <CloudUpload className='w-4 h-4 mr-2' />
                    )}
                    Submit
                  </Button>
                )}

                {isTeacher && onSendCode ? (
                  <Button onClick={handleSendCode} className='ml-auto'>
                    <Send className='mr-2 h-4 w-4' />
                    {selectedStudent
                      ? `Send to ${selectedStudent.displayName}`
                      : 'Send to All'}
                  </Button>
                ) : (
                  onUpdateCode && (
                    <Button
                      onClick={handleUpdateCode}
                      className='ml-auto bg-purple-600 hover:bg-purple-700'
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      ) : (
                        <RefreshCw className='mr-2 h-4 w-4' />
                      )}
                      {isUpdating ? 'Updating...' : 'Update Code'}
                    </Button>
                  )
                )}

                <Button
                  onClick={() => setIsResetDialogOpen(true)}
                  variant='softTealSecondary'
                  disabled={isExecuting}
                >
                  <RotateCcw className='w-4 h-4 mr-2' />
                  Reset Code
                </Button>
              </div>

              {/* Output Section */}
              <div
                className={`flex-auto p-4 overflow-auto ${
                  isDarkTheme ? 'bg-zinc-900' : 'bg-white'
                }`}
              >
                {error ? (
                  <div className='p-2 rounded text-red-500 break-words whitespace-pre-wrap'>
                    {error}
                  </div>
                ) : (
                  <div
                    className={`p-2 rounded ${
                      isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-100'
                    } ${isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'} 
                    whitespace-pre-wrap`}
                  >
                    {output || 'No output yet...'}
                  </div>
                )}

                {isCorrect !== null && !error && (
                  <div
                    className={`mt-4 p-2 rounded ${
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                    }`}
                  >
                    {isCorrect
                      ? '✅ All tests passed!'
                      : '❌ Some tests failed. Check the output above for details.'}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the code to its initial state? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PythonEditor
