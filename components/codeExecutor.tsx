'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, Code2, RotateCcw, CloudUpload } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { useAuth } from '@/contexts/AuthContext'
import { handleExerciseSubmission, handleExerciseRun } from '@/lib/tutorials/utils'
import { ExerciseCodeEditorProps } from '@/types/props'
import { invalidateTutorialProgress } from '@/hooks/tutorial/useTutorialProgress'
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

const PythonCodeEditor = ({
  initialCode,
  expectedOutput,
  exercise_number = 1,
  tutorial_id = 'default',
  isProject = false,
}: ExerciseCodeEditorProps) => {
  const {user} = useAuth()
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'vscode'>('vscode')
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const executeCode = async (isSubmission: boolean) => {
    setIsExecuting(true)
    setError(null)
    setOutput('')
    setIsCorrect(null)

    if (isSubmission) {
      setIsSubmitting(true)
    } else {
      setIsRunning(true)
    }

    try {
      const requestPayload = {
        code,
        exercise_number,
        tutorial_id,
      }

      const endpoint = isSubmission
        ? '/api/py/test-exercise'
        : '/api/py/execute'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()

      // Set output and error states
      setOutput(data.output)
      setError(data.error ? data.output : null)

      // Set correctness for submissions
      if (isSubmission) {
        setIsCorrect(data.success)
      }

      // Handle exercise completion
      if (user && isSubmission && !isProject && code) {
        await handleExerciseSubmission(
          user,
          tutorial_id,
          exercise_number,
          data.success,
          code
        )
        await invalidateTutorialProgress(user.uid, tutorial_id)
      }

      if (user && !isSubmission && !isProject && code) {
        await handleExerciseRun(user, tutorial_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (isSubmission) {
        setIsCorrect(false)
      }
    } finally {
      setIsExecuting(false)
      setIsSubmitting(false)
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput('')
    setError(null)
    setIsCorrect(null)
    setIsResetDialogOpen(false)
  }

  const isDarkTheme = theme === 'dark' || theme === 'vscode'

  return (
    <>
      {' '}
      <div className='flex flex-col h-full rounded-xl overflow-hidden border'>
        {/* Header */}
        <div
          className={`w-full px-4 py-3 flex justify-between items-center flex-none ${
            isDarkTheme ? 'bg-zinc-900' : 'bg-white'
          } border-b ${isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'}`}
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
              Exercise {exercise_number}{' '}
              {tutorial_id !== 'default' && `• ${tutorial_id}`}
            </span>
          </div>
          <ThemeButtons theme={theme} setTheme={setTheme} />
        </div>

        {/* Code Editor - using flex-auto to take remaining space */}
        <div
          className={`${
            isDarkTheme ? 'bg-zinc-950' : 'bg-gray-50'
          } flex-auto flex flex-col min-h-0`}
        >
          <div className='flex-auto min-h-0 p-4'>
            <CodeMirror
              value={code}
              height='100%'
              width='100%'
              theme={getTheme(theme)}
              extensions={[python()]}
              onChange={(value) => setCode(value)}
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
          <div className='p-4 border-t border-zinc-800 flex gap-2'>
            <Button onClick={() => executeCode(false)} disabled={isExecuting}>
              {isRunning ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Play className='w-4 h-4 mr-2' />
              )}
              {isExecuting ? 'Running...' : 'Run Code'}
            </Button>

            {(expectedOutput || isProject) && (
              <Button
                variant='whiteGray'
                onClick={() => executeCode(true)}
                disabled={isExecuting}
              >
                {isSubmitting ? (
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                ) : (
                  <CloudUpload className='w-4 h-4 mr-2' />
                )}
                Submit
              </Button>
            )}

            <Button
              onClick={() => setIsResetDialogOpen(true)}
              variant='softTealSecondary'
              className='ml-auto'
              disabled={isExecuting}
            >
              <RotateCcw className='w-4 h-4 mr-2' />
              Reset Code
            </Button>
          </div>
        </div>

        {/* Output Section - fixed height */}
        <div
          className={`${
            isDarkTheme ? 'bg-zinc-900' : 'bg-white'
          } p-4 flex-none h-35 overflow-auto`}
        >
          {error ? (
            <div className='p-2 rounded text-red-500 break-words whitespace-pre-wrap'>
              {error}
            </div>
          ) : (
            <div
              className={`p-2 rounded ${
                isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-100'
              } 
        ${isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'} whitespace-pre-wrap`}
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
                : isProject
                ? '❌ Some tests failed. Check the output above for details.'
                : '❌ Try again! '}
            </div>
          )}
        </div>
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

export default PythonCodeEditor
