// app/api/execute-python/route.ts
import { spawn } from 'child_process'
import { randomBytes } from 'crypto'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Create a temporary file with a random name
    const fileName = `${randomBytes(16).toString('hex')}.py`
    const filePath = join(tmpdir(), fileName)

    try {
      // Write the code to a temporary file
      await writeFile(filePath, code)

      // Execute the Python script with a timeout
      const output = await executePythonScript(filePath)

      return NextResponse.json({ output })
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to execute code',
        },
        { status: 500 }
      )
    } finally {
      // Clean up the temporary file
      try {
        await unlink(filePath)
      } catch (error) {
        console.error('Failed to delete temporary file:', error)
      }
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 })
  }
}

async function executePythonScript(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = ''
    let errorOutput = ''

    const process = spawn('python', [filePath], {
      timeout: 5000, // 5 second timeout
    })

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    process.on('error', (error) => {
      reject(new Error(`Failed to execute Python: ${error.message}`))
    })

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(errorOutput || 'Process exited with non-zero code'))
      } else {
        resolve(output)
      }
    })

    // Handle timeout
    setTimeout(() => {
      process.kill()
      reject(new Error('Execution timed out'))
    }, 5000)
  })
}
