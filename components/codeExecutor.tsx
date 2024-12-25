// export default PythonCodeEditor
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, Sun, Moon, Code2 } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import {
  vscodeDark,
  vscodeLight,
} from '@uiw/codemirror-theme-vscode'
import { python } from '@codemirror/lang-python'
import { Select } from '@/components/ui/select'

interface CodeEditorProps {
  initialCode: string
  expectedOutput?: string
  exercise_number?: number
  tutorial_id?: string
}

const PythonCodeEditor = ({
  initialCode,
  expectedOutput,
  exercise_number = 1,
  tutorial_id = 'default',
}: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'vscode'>('vscode')

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

  // Calculate dynamic height based on code lines
  const calculateHeight = () => {
    const lineCount = code.split('\n').length
    return Math.max(150, Math.min(lineCount * 20 + 50, 500)) // Max height of 500px
  }

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
        body: JSON.stringify({
          code,
          exercise_number,
          tutorial_id,
        }),
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

  const isDarkTheme = theme === 'dark' || theme === 'vscode'

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'
      }`}
    >
      {/* Header with Exercise Info and Theme Selector */}
      <div
        className={`px-4 py-3 flex justify-between items-center ${
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
            className={theme === 'light' ? 'text-amber-500' : ''}
          >
            <Sun className='w-4 h-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'text-blue-500' : ''}
          >
            <Moon className='w-4 h-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setTheme('vscode')}
            className={theme === 'vscode' ? 'text-purple-500' : ''}
          >
            <Code2 className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className={`${isDarkTheme ? 'bg-zinc-950' : 'bg-gray-50'} p-4`}>
        <CodeMirror
          value={code}
          height={`${calculateHeight()}px`}
          theme={getTheme()}
          extensions={[python()]}
          onChange={(value) => setCode(value)}
        />
        <div className='mt-4'>
          <Button
            onClick={runCode}
            className='bg-emerald-600 hover:bg-emerald-700 text-white'
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
      <div className={`${isDarkTheme ? 'bg-zinc-900' : 'bg-white'} px-4 py-2 `}>
        {/* <div className='flex items-center gap-2 mb-3'> */}
        <h3
          className={`mt-3 font-medium ${
            isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'
          }`}
        >
          Output
        </h3>
        {/* </div> */}

        {error ? (
          <pre className='font-mono text-sm text-red-500 whitespace-pre-wrap'>
            {error}
          </pre>
        ) : (
          <pre
            className={`font-mono text-sm ${
              isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-100'
            } ${
              isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'
            } whitespace-pre-wrap`}
          >
            {output || 'No output yet...'}
          </pre>
        )}

        {expectedOutput && isCorrect !== null && !error && (
          <div
            className={`mt-4 p-2 rounded ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
            }`}
          >
            {isCorrect
              ? '✅ Correct!'
              : '❌ Try again! \nExpected Output: ' + expectedOutput}
          </div>
        )}
      </div>
    </div>
  )
}

export default PythonCodeEditor