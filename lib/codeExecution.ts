import { MongoClient, ObjectId } from 'mongodb'
import { spawn } from 'child_process'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri!)

export async function updateStudentProgress(
  classroomId: string,
  username: string,
  weekNumber: number,
  taskId: number,
  passed: boolean,
  code: string
): Promise<void> {
  try {
    await client.connect()
    const db = client.db('pythonbit')
    if (passed) {
      await db.collection('classrooms').updateOne(
        {
          _id: new ObjectId(classroomId),
          'weeks.weekNumber': weekNumber,
          'weeks.students.username': username,
        },
        {
          $addToSet: {
            'weeks.$[week].students.$[student].completedTasks': taskId,
          },
          $set: {
            'weeks.$[week].students.$[student].code': code,
          },
        },
        {
          arrayFilters: [
            { 'week.weekNumber': weekNumber },
            { 'student.username': username },
          ],
        }
      )
    }
  } finally {
    await client.close()
  }
}

export async function executeAndTestCode(
  code: string,
  taskId: string
): Promise<{
  passed: boolean
  output: string
  expectedOutput: string
  expectedVariables: { [key: string]: any }
}> {
  return new Promise<{
    passed: boolean
    output: string
    expectedOutput: string
    expectedVariables: { [key: string]: any }
  }>((resolve, reject) => {
    const python = spawn('python3', ['-c', code])
    let output = ''
    let error = ''

    python.stdout.on('data', (data) => {
      output += data.toString()
    })

    python.stderr.on('data', (data) => {
      error += data.toString()
    })

    python.on('close', async (exitCode) => {
      if (exitCode !== 0) {
        resolve({
          passed: false,
          output: error,
          expectedOutput: '',
          expectedVariables: {},
        })
        return
      }

      try {
        const testResult = await checkTestCases(taskId, output.trim())
        resolve({
          passed: testResult.passed,
          output: output.trim(),
          expectedOutput: testResult.expectedOutput,
          expectedVariables: testResult.expectedVariables,
        })
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function checkTestCases(
  taskId: string,
  output: string
): Promise<{
  passed: boolean
  expectedOutput: string
  expectedVariables: { [key: string]: any }
}> {
  try {
    await client.connect()
    const db = client.db('pythonbit')
    const assignment = await db
      .collection('assignments')
      .findOne(
        { 'tasks.id': parseInt(taskId) },
        { projection: { 'tasks.$': 1 } }
      )

    if (!assignment || !assignment.tasks || assignment.tasks.length === 0) {
      throw new Error('Task not found')
    }

    const task = assignment.tasks[0]
    const testCases = task.testCases

    let passed = true
    let expectedOutput = ''
    let expectedVariables: { [key: string]: any } = {}

    for (const testCase of testCases) {
      console.log('Checking test case:', testCase)
      if (testCase.expectedOutput) {
        expectedOutput = testCase.expectedOutput
        passed = passed && output === expectedOutput
        if (!passed) {
          console.error('Output mismatch:', {
            expected: testCase.expectedOutput,
            got: output,
          })
        }
      }

      if (testCase.expectedVariables) {
        expectedVariables = testCase.expectedVariables
        passed = passed && validateVariables(expectedVariables, output)
        if (!passed) {
          console.error('Variable validation failed')
        }
      }
    }

    return {
      passed,
      expectedOutput,
      expectedVariables,
    }
  } finally {
    await client.close()
  }
}

function validateVariables(
  expectedVariables: {
    [key: string]: { type: 'string' | 'number'; validation: string }
  },
  output: string
): boolean {
  let passed = true

  for (const [varName, expectedValue] of Object.entries(expectedVariables)) {
    console.log(`Validating variable: ${varName}`)
    const actualValue = eval(`let ${varName}; ${output}; return ${varName}`)

    if (expectedValue.type === 'string' && typeof actualValue !== 'string') {
      passed = false
      console.error(`Variable "${varName}" should be a string`)
    }

    if (expectedValue.type === 'number' && typeof actualValue !== 'number') {
      passed = false
      console.error(`Variable "${varName}" should be a number`)
    }

    if (!eval(`(${expectedValue.validation})`, { val: actualValue })) {
      passed = false
      console.error(
        `Variable "${varName}" failed validation: ${expectedValue.validation}`
      )
    }
  }

  return passed
}
