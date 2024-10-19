// File: app/api/submit-code/route.ts

import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { spawn } from 'child_process'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri!)

export async function POST(request: Request) {
  const body = await request.json()
  const { code, classroomId, username, taskId } = body

  if (!code || !classroomId || !username || !taskId) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    await client.connect()
    const db = client.db('pythonbit')

    const result = await executeAndTestCode(code, taskId)
    await updateStudentProgress(
      db,
      classroomId,
      username,
      taskId,
      result.passed
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in code submission:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

async function executeAndTestCode(code: string, taskId: string) {
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

      const testResult = await checkTestCases(taskId, output.trim())
      resolve({
        passed: testResult.passed,
        output: output.trim(),
        expectedOutput: testResult.expectedOutput,
      })
    })
  })
}

async function checkTestCases(taskId: string, output: string) {
  const db = client.db('pythonbit')
  const assignment = await db
    .collection('assignments')
    .findOne({ 'tasks.id': parseInt(taskId) }, { projection: { 'tasks.$': 1 } })

  if (!assignment || !assignment.tasks || assignment.tasks.length === 0) {
    throw new Error('Task not found')
  }

  const task = assignment.tasks[0]
  const testCase = task.testCases[0] // Assuming one test case per task for simplicity

  return {
    passed: output === testCase.expectedOutput,
    expectedOutput: testCase.expectedOutput,
  }
}

async function updateStudentProgress(
  db: any,
  classroomId: string,
  username: string,
  taskId: string,
  passed: boolean
) {
  if (passed) {
    await db
      .collection('classrooms')
      .updateOne(
        { _id: new ObjectId(classroomId), 'students.username': username },
        { $addToSet: { 'students.$.completedTasks': taskId } }
      )
  }
}
