// api/submit-code
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

interface SubmitCodeRequest {
  code: string
  problemId: string
  testCases: Array<{
    input: string
    expected: string
  }>
}

async function executeCode(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['-c', code], {
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
}

async function runTest(
  code: string,
  problemId: string,
  testCase: { input: string; expected: string }
) {
  if (problemId === 'file-processor') {
    try {
      const output = await executeCode(code)
      // Take only the first line of output
      const result = output.trim().split('\n')[0]

      // Parse output as JSON
      let parsedOutput
      try {
        parsedOutput = JSON.parse(result)
      } catch {
        parsedOutput = result
      }

      const isEqual =
        JSON.stringify(parsedOutput) === JSON.stringify(testCase.expected)
      return {
        success: isEqual,
        output: parsedOutput,
        expected: testCase.expected,
      }
    } catch (error) {
      console.error('Test execution error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
        expected: testCase.expected,
      }
    }
  } else {
    // For all other problem types
    const functionName = problemId.replace(/-/g, '_')
    const testCode = `
${code}
result = ${functionName}(${testCase.input !== undefined ? testCase.input : ''})
print(result)
`
    try {
      const output = await executeCode(testCode)
      const result = output.trim()

      let parsedOutput
      try {
        parsedOutput = JSON.parse(result)
      } catch {
        parsedOutput = result
      }

      const parsedExpected = testCase.expected
      const isEqual =
        JSON.stringify(parsedOutput) === JSON.stringify(parsedExpected)

      return {
        success: isEqual,
        output: parsedOutput,
        expected: parsedExpected,
      }
    } catch (error) {
      console.error('Test execution error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
        expected: testCase.expected,
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const { code, problemId, testCases }: SubmitCodeRequest = await req.json()
    console.log('Received submission:', { problemId, testCases })

    const testResults = []
    for (const testCase of testCases) {
      console.log('Running test case:', testCase)
      const result = await runTest(code, problemId, testCase)
      testResults.push(result)

      if (!result.success) {
        console.log('Test failed:', result)
        return NextResponse.json({
          success: false,
          error:
            result.error ||
            `Test failed: Expected ${JSON.stringify(
              testCase.expected
            )}, got ${JSON.stringify(result.output)}`,
          testResults,
        })
      }
    }

    console.log('All tests passed:', testResults)
    return NextResponse.json({
      success: true,
      testResults,
    })
  } catch (error) {
    console.error('API error:', error)
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
