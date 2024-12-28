// app/api/execute-code/route.ts
import { spawn } from 'child_process'
import { randomBytes } from 'crypto'
import { writeFile, unlink, access } from 'fs/promises'
import { join } from 'path'
import { tmpdir, platform, release, type } from 'os'
import { NextResponse } from 'next/server'

interface ExecuteCodeRequest {
  code: string
  functionName?: string
  input?: string
}

interface PythonEnvironment {
  command: string
  path: string
  packages: string[]
}

const TIMEOUT_MS = 5000
const MAX_OUTPUT_LENGTH = 100000

// Environment-specific configurations
const environments: { [key: string]: PythonEnvironment } = {
  development: {
    command: platform() === 'win32' ? 'python' : 'python3',
    path:
      platform() === 'win32'
        ? 'C:\\Python39\\Lib\\site-packages'
        : '/usr/local/lib/python3.9/site-packages',
    packages: ['numpy', 'pandas', 'matplotlib'],
  },
  production: {
    command: '/usr/bin/python3',
    path: '/usr/local/lib/python3.9/site-packages',
    packages: ['numpy', 'pandas', 'matplotlib'],
  },
  docker: {
    command: 'python3',
    path: '/usr/local/lib/python3/site-packages',
    packages: ['numpy', 'pandas', 'matplotlib'],
  },
}

async function checkPythonEnvironment(): Promise<PythonEnvironment> {
  const env = process.env.NODE_ENV || 'development'
  const config = environments[env]

  try {
    // Check if Python is accessible
    await new Promise<void>((resolve, reject) => {
      const pythonCheck = spawn(config.command, ['--version'])
      pythonCheck.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Python check failed with code ${code}`))
      })
    })

    // Check if path exists
    await access(config.path)

    return config
  } catch (error) {
    console.error('Python environment check failed:', error)
    throw new Error('Python environment is not properly configured')
  }
}

async function executePythonCode(filePath: string): Promise<string> {
  const pythonEnv = await checkPythonEnvironment()

  return new Promise((resolve, reject) => {
    console.log(`Executing Python on ${platform()} (${type()} ${release()})`)

    const python = spawn(pythonEnv.command, [filePath], {
      timeout: TIMEOUT_MS,
      env: {
        ...process.env,
        PYTHONPATH: pythonEnv.path,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUNBUFFERED: '1',
        // Add platform-specific environment variables
        ...(platform() === 'win32' && {
          PYTHONLEGACYWINDOWSSTDIO: '1',
        }),
      },
    })

    let stdout = ''
    let stderr = ''

    python.stdout.on('data', (data) => {
      stdout += data.toString()
      if (stdout.length > MAX_OUTPUT_LENGTH) {
        python.kill()
        reject(new Error('Output exceeded maximum length'))
      }
    })

    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    python.on('error', reject)

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Process exited with code ${code}`))
      } else {
        resolve(stdout)
      }
    })

    // Set timeout with cleanup
    const timeoutId = setTimeout(() => {
      try {
        process.kill(-python.pid!) // Kill process group
      } catch (e) {
        python.kill()
      }
      reject(new Error('Execution timed out'))
    }, TIMEOUT_MS)

    python.on('close', () => clearTimeout(timeoutId))
  })
}

export async function POST(req: Request) {
  let filePath = ''

  try {
    const { code, functionName, input }: ExecuteCodeRequest = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }

    // Add safety imports and configurations
    const safetyPrelude = `
import sys
import signal
from contextlib import contextmanager
import threading
import _thread

class TimeoutException(Exception): pass

@contextmanager
def time_limit(seconds):
    timer = threading.Timer(seconds, lambda: _thread.interrupt_main())
    timer.start()
    try:
        yield
    except KeyboardInterrupt:
        raise TimeoutException("Timed out")
    finally:
        timer.cancel()

sys.setrecursionlimit(3000)  # Limit recursion
`

    // Prepare execution code with safety measures
    let executionCode = `${safetyPrelude}\n${code}`
    if (functionName) {
      executionCode = `
${safetyPrelude}
${code}
with time_limit(${TIMEOUT_MS / 1000}):
    result = ${functionName}(${input ?? ''})
    print(result)
`
    }

    // Create temporary file with platform-specific path handling
    const fileName = `${randomBytes(16).toString('hex')}.py`
    filePath = join(tmpdir(), fileName)

    await writeFile(filePath, executionCode)
    const output = await executePythonCode(filePath)

    return NextResponse.json({
      success: true,
      output: output.trim(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error('Python execution error:', error)

    let errorMessage = 'An unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
      if (errorMessage.includes('Traceback')) {
        errorMessage = errorMessage.split('\n').slice(-2).join('\n')
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  } finally {
    if (filePath) {
      try {
        await unlink(filePath)
      } catch (error) {
        console.error('Failed to delete temporary file:', error)
      }
    }
  }
}
