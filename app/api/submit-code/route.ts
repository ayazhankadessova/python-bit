// // Worked for 5 tasks:
// import { NextResponse } from 'next/server'
// import { spawn } from 'child_process'

// interface SubmitCodeRequest {
//   code: string
//   problemId: string
//   testCases: Array<{
//     input: any
//     expected: any
//   }>
// }

// function wrapInputValue(input: any): string {
//   if (typeof input === 'string') {
//     // Escape single quotes and wrap in single quotes
//     return `'${input.replace(/'/g, "\\'")}'`
//   } else if (Array.isArray(input)) {
//     // Handle arrays by converting each element
//     return `[${input.map((item) => wrapInputValue(item)).join(', ')}]`
//   } else if (input === null) {
//     return 'None'
//   } else if (typeof input === 'object') {
//     // Convert object to Python dict
//     const entries = Object.entries(input).map(
//       ([key, value]) => `'${key}': ${wrapInputValue(value)}`
//     )
//     return `{${entries.join(', ')}}`
//   }
//   // Numbers, booleans can be converted directly
//   return String(input)
// }

// function executeCode(code: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     console.log('Executing code:', code)

//     const python = spawn('python3', ['-c', code], {
//       timeout: 10000,
//       env: {
//         ...process.env,
//         PYTHONPATH: '/usr/local/lib/python3.9/site-packages',
//       },
//     })

//     let output = ''
//     let error = ''

//     python.stdout.on('data', (data) => {
//       const chunk = data.toString()
//       console.log('Python stdout:', chunk)
//       output += chunk
//     })

//     python.stderr.on('data', (data) => {
//       const chunk = data.toString()
//       console.log('Python stderr:', chunk)
//       error += chunk
//     })

//     python.on('close', (code) => {
//       console.log('Python process closed with code:', code)
//       if (code !== 0) {
//         reject(new Error(error || `Process exited with code ${code}`))
//       } else {
//         resolve(output)
//       }
//     })

//     python.on('error', (err) => {
//       console.error('Python process error:', err)
//       reject(err)
//     })
//   })
// }

// async function runTest(
//   code: string,
//   problemId: string,
//   testCase: { input: any; expected: any }
// ) {
//   // Get function name from problemId
//   const functionName = problemId.replace(/-/g, '_')
//   console.log('Running test with function name:', functionName)

//   // Properly wrap the input value based on its type
//   const wrappedInput = wrapInputValue(testCase.input)

//   const testCode = `
// ${code}
// try:
//     result = ${functionName}(${wrappedInput})
//     print(result)
// except Exception as e:
//     print(f"Error: {str(e)}")
//     exit(1)
// `
//   console.log('Generated test code:', testCode)

//   try {
//     const output = await executeCode(testCode)
//     const result = output.trim()
//     console.log('Test result:', { output: result, expected: testCase.expected })

//     // Convert expected to string for comparison, handling special cases
//     let expectedStr =
//       typeof testCase.expected === 'object'
//         ? JSON.stringify(testCase.expected)
//         : String(testCase.expected)

//     return {
//       success: result === expectedStr,
//       output: result,
//       expected: testCase.expected,
//     }
//   } catch (error) {
//     console.error('Test execution error:', error)
//     return {
//       success: false,
//       error:
//         error instanceof Error ? error.message : 'An unknown error occurred',
//       expected: testCase.expected,
//     }
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { code, problemId, testCases }: SubmitCodeRequest = await req.json()
//     console.log('Received submission:', { problemId, testCases })

//     const testResults = []
//     for (const testCase of testCases) {
//       console.log('Running test case:', testCase)
//       const result = await runTest(code, problemId, testCase)
//       testResults.push(result)

//       if (!result.success) {
//         console.log('Test failed:', result)
//         return NextResponse.json({
//           success: false,
//           error:
//             result.error ||
//             `Test failed: Expected ${testCase.expected}, got ${result.output}`,
//           testResults,
//         })
//       }
//     }

//     console.log('All tests passed:', testResults)
//     return NextResponse.json({
//       success: true,
//       testResults,
//     })
//   } catch (error) {
//     console.error('API error:', error)
//     return NextResponse.json(
//       {
//         success: false,
//         error:
//           error instanceof Error ? error.message : 'An unknown error occurred',
//       },
//       { status: 500 }
//     )
//   }
// }

import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

interface SubmitCodeRequest {
  code: string
  problemId: string
  testCases: Array<{
    input: any
    expected: any
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
  testCase: { input: any; expected: any }
) {
  // Convert problem ID to function name
  const functionName = problemId.replace(/-/g, '_')

  // Create test code that calls the function with input
  const testCode = `
${code}
result = ${functionName}(${testCase.input !== undefined ? testCase.input : ''})
print(result)
`

  try {
    const output = await executeCode(testCode)
    const result = output.trim()

    // Parse output and expected values for comparison
    let parsedOutput
    try {
      parsedOutput = JSON.parse(result)
    } catch {
      parsedOutput = result
    }

    let parsedExpected = testCase.expected

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
