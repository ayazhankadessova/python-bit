// app/api/execute-code/route.ts
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

interface ExecuteCodeRequest {
  code: string
  functionName?: string
  input?: string
}

export async function POST(req: Request) {
  try {
    const { code, functionName, input }: ExecuteCodeRequest = await req.json()

    let executionCode = code
    if (functionName) {
      // If a function name is provided, add code to call it
      executionCode = `
${code}
result = ${functionName}(${input ?? ''})
print(result)
`
    }

    console.log('Executing code:', executionCode)

    const output = await new Promise<string>((resolve, reject) => {
      const python = spawn('python3', ['-c', executionCode], {
        timeout: 10000,
      })

      let stdout = ''
      let stderr = ''

      python.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      python.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `Process exited with code ${code}`))
        } else {
          resolve(stdout)
        }
      })

      python.on('error', reject)
    })

    return NextResponse.json({ success: true, output: output.trim() })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    )
  }
}
