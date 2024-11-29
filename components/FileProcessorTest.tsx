// import React, { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// interface TestResult {
//   success: boolean
//   output?: any
//   expected?: any
//   error?: string
// }

// interface TestCase {
//   name: string
//   fileContent: string
//   fileName: string
//   expected: any
// }

// const FileProcessorTest = ({ code }: { code: string }) => {
//   const [testResults, setTestResults] = useState<TestResult[]>([])
//   const [isRunning, setIsRunning] = useState(false)

//   // Test cases including file content
//   const testCases: TestCase[] = [
//     {
//       name: 'Basic file test',
//       fileContent: 'Hello world\nPython is fun',
//       fileName: 'sample.txt',
//       expected: { lines: 2, words: 5, chars: 25 },
//     },
//     {
//       name: 'Empty file test',
//       fileContent: '',
//       fileName: 'empty.txt',
//       expected: { lines: 0, words: 0, chars: 0 },
//     },
//     {
//       name: 'File not found test',
//       fileContent: '',
//       fileName: 'nonexistent.txt',
//       expected: { error: 'File not found' },
//     },
//   ]

//   const runTest = async (testCase: TestCase): Promise<TestResult> => {
//     try {
//       // Prepare the test environment code
//       const testSetup = `
// import os
// import json

// def create_test_file(filename, content):
//     try:
//         with open(filename, 'w') as f:
//             f.write(content)
//     except:
//         pass

// def cleanup_test_file(filename):
//     try:
//         os.remove(filename)
//     except:
//         pass

// ${code}  # Student's code is inserted here

// # Only create the file if it's not the nonexistent file test
// if "${testCase.fileName}" != "nonexistent.txt":
//     create_test_file("${testCase.fileName}", """${testCase.fileContent}""")

// try:
//     # Run test
//     result = file_processor("${testCase.fileName}")
//     print(json.dumps(result))  # Only print once, using json.dumps
// except Exception as e:
//     print(json.dumps({"error": str(e)}))
// finally:
//     # Cleanup
//     if "${testCase.fileName}" != "nonexistent.txt":
//         cleanup_test_file("${testCase.fileName}")
// `

//       const response = await fetch('/api/submit-code', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           code: testSetup,
//           problemId: 'file-processor',
//           testCases: [
//             {
//               input: `"${testCase.fileName}"`,
//               expected: testCase.expected,
//             },
//           ],
//         }),
//       })

//       const data = await response.json()

//       // Parse the test result
//       if (data.testResults && data.testResults[0]) {
//         const result = data.testResults[0]
//         // Take only the first line of output if there are multiple
//         if (typeof result.output === 'string') {
//           try {
//             result.output = JSON.parse(result.output.split('\n')[0])
//           } catch (e) {
//             console.error('Error parsing output:', e)
//           }
//         }
//         return result
//       }

//       return data.testResults[0]
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : 'An unknown error occurred',
//       }
//     }
//   }

//   const runAllTests = async () => {
//     setIsRunning(true)
//     const results = []

//     for (const testCase of testCases) {
//       const result = await runTest(testCase)
//       results.push(result)
//     }

//     setTestResults(results)
//     setIsRunning(false)
//   }

//   return (
//     <div className='space-y-6'>
//       <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
//         {testCases.map((testCase, index) => (
//           <div
//             key={index}
//             className='p-4 rounded-lg border border-gray-200 dark:border-gray-700'
//           >
//             <h3 className='font-medium mb-2'>{testCase.fileName}</h3>
//             {testCase.fileName === 'nonexistent.txt' ? (
//               <div className='text-sm text-red-500 italic'>
//                 File does not exist
//               </div>
//             ) : (
//               <div className='font-mono text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded'>
//                 {testCase.fileContent || (
//                   <em className='text-gray-500'>Empty file</em>
//                 )}
//               </div>
//             )}
//             <div className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
//               Expected output: {JSON.stringify(testCase.expected)}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='flex flex-col space-y-4'>
//         <Button
//           onClick={runAllTests}
//           disabled={isRunning}
//           className='w-full md:w-auto'
//         >
//           {isRunning ? 'Running Tests...' : 'Run Tests'}
//         </Button>

//         <div className='space-y-2'>
//           {testResults.map((result, index) => (
//             <Alert
//               key={index}
//               variant={result.success ? 'default' : 'destructive'}
//             >
//               <AlertTitle>
//                 Test Case {index + 1}: {testCases[index].name}
//               </AlertTitle>
//               <AlertDescription>
//                 {result.success ? (
//                   <div className='text-green-600'>
//                     Test passed: Expected {JSON.stringify(result.expected)} and
//                     got {JSON.stringify(result.output)}
//                   </div>
//                 ) : (
//                   <div className='text-red-600'>
//                     {result.error ||
//                       `Test failed: Expected ${JSON.stringify(
//                         result.expected
//                       )}, got ${JSON.stringify(result.output)}`}
//                   </div>
//                 )}
//               </AlertDescription>
//             </Alert>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default FileProcessorTest
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { useToast } from '@/hooks/use-toast'
import { Socket } from 'socket.io-client'

interface TestResult {
  success: boolean
  output?: any
  expected?: any
  error?: string
}

interface TestCase {
  name: string
  fileContent: string
  fileName: string
  expected: any
}

interface FileProcessorTestProps {
  code: string
  socket: Socket | null
  userId: string
  classroomId: string
  onProblemComplete: (problemId: string) => void
}

const FileProcessorTest = ({
  code,
  socket,
  userId,
  classroomId,
  onProblemComplete,
}: FileProcessorTestProps) => {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const testCases: TestCase[] = [
    {
      name: 'Basic file test',
      fileContent: 'Hello world\nPython is fun',
      fileName: 'sample.txt',
      expected: { lines: 2, words: 5, chars: 25 },
    },
    {
      name: 'Empty file test',
      fileContent: '',
      fileName: 'empty.txt',
      expected: { lines: 0, words: 0, chars: 0 },
    },
    {
      name: 'File not found test',
      fileContent: '',
      fileName: 'nonexistent.txt',
      expected: { error: 'File not found' },
    },
  ]

  const runTest = async (testCase: TestCase): Promise<TestResult> => {
    try {
      const testSetup = `
import os
import json

def create_test_file(filename, content):
    try:
        with open(filename, 'w') as f:
            f.write(content)
    except:
        pass

def cleanup_test_file(filename):
    try:
        os.remove(filename)
    except:
        pass

${code}  # Student's code is inserted here

# Only create the file if it's not the nonexistent file test
if "${testCase.fileName}" != "nonexistent.txt":
    create_test_file("${testCase.fileName}", """${testCase.fileContent}""")

try:
    # Run test
    result = file_processor("${testCase.fileName}")
    print(json.dumps(result))  # Only print once, using json.dumps
except Exception as e:
    print(json.dumps({"error": str(e)}))
finally:
    # Cleanup
    if "${testCase.fileName}" != "nonexistent.txt":
        cleanup_test_file("${testCase.fileName}")
`

      const response = await fetch('/api/submit-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: testSetup,
          problemId: 'file-processor',
          testCases: [
            {
              input: `"${testCase.fileName}"`,
              expected: testCase.expected,
            },
          ],
        }),
      })

      const data = await response.json()

      if (data.testResults && data.testResults[0]) {
        const result = data.testResults[0]
        if (typeof result.output === 'string') {
          try {
            result.output = JSON.parse(result.output.split('\n')[0])
          } catch (e) {
            console.error('Error parsing output:', e)
          }
        }
        return result
      }

      return data.testResults[0]
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }

  const updateCompletionStatus = async () => {
    try {
      // Update Firestore
      const userRef = doc(fireStore, 'users', userId)
      await updateDoc(userRef, {
        solvedProblems: arrayUnion('file-processor'),
      })

      // Notify teacher through socket
      socket?.emit('task-completed', {
        taskId: 'file-processor',
        studentId: userId,
        classroomId,
      })

      // Update local state through parent component
      onProblemComplete('file-processor')

      toast({
        title: 'Success!',
        description: 'Problem completed successfully!',
      })
    } catch (error) {
      console.error('Error updating completion status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update completion status',
        variant: 'destructive',
      })
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    const results = []

    for (const testCase of testCases) {
      const result = await runTest(testCase)
      results.push(result)
    }

    setTestResults(results)
    setIsRunning(false)

    // Check if all tests passed
    const allTestsPassed = results.every((result) => result.success)
    if (allTestsPassed) {
      await updateCompletionStatus()
    }
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {testCases.map((testCase, index) => (
          <div
            key={index}
            className='p-4 rounded-lg border border-gray-200 dark:border-gray-700'
          >
            <h3 className='font-medium mb-2'>{testCase.fileName}</h3>
            {testCase.fileName === 'nonexistent.txt' ? (
              <div className='text-sm text-red-500 italic'>
                File does not exist
              </div>
            ) : (
              <div className='font-mono text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded'>
                {testCase.fileContent || (
                  <em className='text-gray-500'>Empty file</em>
                )}
              </div>
            )}
            <div className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Expected output: {JSON.stringify(testCase.expected)}
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-col space-y-4'>
        <Button
          onClick={runAllTests}
          disabled={isRunning}
          className='w-full md:w-auto'
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>

        <div className='space-y-2'>
          {testResults.map((result, index) => (
            <Alert
              key={index}
              variant={result.success ? 'default' : 'destructive'}
            >
              <AlertTitle>
                Test Case {index + 1}: {testCases[index].name}
              </AlertTitle>
              <AlertDescription>
                {result.success ? (
                  <div className='text-green-600'>
                    Test passed: Expected {JSON.stringify(result.expected)} and
                    got {JSON.stringify(result.output)}
                  </div>
                ) : (
                  <div className='text-red-600'>
                    {result.error ||
                      `Test failed: Expected ${JSON.stringify(
                        result.expected
                      )}, got ${JSON.stringify(result.output)}`}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FileProcessorTest
