import { MongoClient, ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri!)

export async function updateStudentProgress(
  classroomId: string,
  username: string,
  weekNumber: number,
  taskId: number,
  passed: boolean
) {
  try {
    await client.connect()
    const db = client.db('pythonbit')

    if (passed) {
      await db.collection('classrooms').updateOne(
        {
          _id: new ObjectId(classroomId),
          'weeks.weekNumber': weekNumber,
        },
        {
          $addToSet: {
            'weeks.$[week].students.$[student].completedTasks': taskId,
          },
          //   $set: {
          //     'weeks.$[week].students.$[student].code': code,
          //   },
          $setOnInsert: {
            'weeks.$[week].students.$[student]': {
              username,
              completedTasks: [taskId],
              //   code: code,
            },
          },
        },
        {
          arrayFilters: [
            { 'week.weekNumber': weekNumber },
            { 'student.username': username },
          ],
          upsert: true,
        }
      )
    }
  } finally {
    await client.close()
  }
}
export async function executeAndTestCode(code: string, taskId: string) {
  return new Promise<{
    passed: boolean
    output: string
    expectedOutput: string
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
        resolve({ passed: false, output: error, expectedOutput: '' })
        return
      }
      try {
        const testResult = await checkTestCases(taskId, output.trim())
        resolve({
          passed: testResult.passed,
          output: output.trim(),
          expectedOutput: testResult.expectedOutput,
        })
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function checkTestCases(taskId: string, output: string) {
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
    const testCase = task.testCases[0] // Assuming one test case per task for simplicity

    return {
      passed: output === testCase.expectedOutput,
      expectedOutput: testCase.expectedOutput,
    }
  } finally {
    await client.close()
  }
}
