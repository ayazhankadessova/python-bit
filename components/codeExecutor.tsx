'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, Sun, Moon, Code2 } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { useAuth } from '@/contexts/AuthContext'
import { handleExerciseCompletion } from './session-views/helpers'
import { CodeEditorProps } from '@/types/props'

const PythonCodeEditor = ({
  initialCode,
  expectedOutput,
  exercise_number = 1,
  tutorial_id = 'default',
  testCode,
  isProject = false,
}: CodeEditorProps) => {
  const user = useAuth()
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'vscode'>('vscode')
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTheme = () => {
    switch (theme) {
      case 'light':
        return vscodeLight
      case 'dark':
        return vscodeDark
      default:
        return vscodeLight
    }
  }

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
      // Only include test code if this is a submission
      const codeToExecute =
        isSubmission && isProject ? `${code}\n\n${testCode}` : code

      // Prepare the request payload
      const requestPayload = {
        code: codeToExecute,
        exercise_number,
        tutorial_id,
      }

      // Fetch from Flask backend
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()

      // Handle different response structures
      const executionOutput = data.output ? data.output.trim() : ''

      // Set output
      setOutput(executionOutput)

      // Only check correctness if this is a submission
      if (isSubmission) {
        // Determine correctness based on project or expected output
        if (isProject) {
          // For projects, check if there are no errors
          setIsCorrect(
            !executionOutput.includes('AssertionError') &&
              !executionOutput.includes('Error') &&
              !data.error
          )
        } else if (expectedOutput) {
          // For specific exercises, compare with expected output
          setIsCorrect(executionOutput === expectedOutput.trim())
          if (executionOutput === expectedOutput.trim() && user) {
            console.log('sending to fb!')
            await handleExerciseCompletion(
              user.user!,
              tutorial_id,
              exercise_number
            )
          }
        }

        // Handle exercise completion if correct
        // if (isCorrect && user) {
        //   console.log("sending to fb!")
        //   await handleExerciseCompletion(
        //     user.user!,
        //     tutorial_id,
        //     exercise_number
        //   )
        // }
      }

      // Handle any errors from the backend
      if (data.error) {
        setError(executionOutput)
      }
    } catch (err) {
      // Handle network or parsing errors
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (isSubmission) {
        setIsCorrect(false)
      }
    } finally {
      // Reset executing states
      setIsExecuting(false)

      if (isSubmission) {
        setIsSubmitting(false)
      } else {
        setIsRunning(false)
      }
    }
  }

  const isDarkTheme = theme === 'dark' || theme === 'vscode'

  return (
    <div className='flex flex-col h-full'>
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
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'text-amber-500' : 'text-amber-200'}
          >
            <Sun className='w-4 h-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'text-blue-500' : 'text-blue-200'}
          >
            <Moon className='w-4 h-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setTheme('vscode')}
            className={
              theme === 'vscode' ? 'text-purple-500' : 'text-purple-200'
            }
          >
            <Code2 className='w-4 h-4' />
          </Button>
        </div>
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
            theme={getTheme()}
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
          <Button
            onClick={() => executeCode(false)}
            className='bg-emerald-600 hover:bg-emerald-700 text-white'
            disabled={isExecuting}
          >
            {isRunning ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Play className='w-4 h-4 mr-2' />
            )}
            {isExecuting ? 'Running...' : 'Run Code'}
          </Button>

          {(expectedOutput || isProject) && (
            <Button
              onClick={() => executeCode(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white'
              disabled={isExecuting}
            >
              {isSubmitting ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Play className='w-4 h-4 mr-2' />
              )}
              Submit
            </Button>
          )}
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
              : '❌ Try again! \nExpected Output: ' + expectedOutput}
          </div>
        )}
      </div>
    </div>
  )
}

export default PythonCodeEditor
