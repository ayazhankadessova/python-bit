import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { executeAndTestCode } from '@/lib/codeExecution'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, classroomId, username, taskId, weekNumber } = body

    if (!code || !classroomId || !username || !taskId || !weekNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await executeAndTestCode(code, taskId)
    const client = await clientPromise
    const db = client.db('pythonbit')

    if (result.passed) {
      // First, check if the weeklyProgress document exists
      const weeklyProgress = await db.collection('weeklyProgress').findOne({
        classroomId: new ObjectId(classroomId),
        weekNumber: parseInt(weekNumber),
      })

      if (!weeklyProgress) {
        // If the weeklyProgress document doesn't exist, create it
        await db.collection('weeklyProgress').insertOne({
          classroomId: new ObjectId(classroomId),
          weekNumber: parseInt(weekNumber),
          tasks: [{ taskId: parseInt(taskId), completedBy: [username] }],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      } else {
        // If the weeklyProgress document exists, check if the task exists
        const taskExists = weeklyProgress.tasks.some(
          (task) => task.taskId === parseInt(taskId)
        )

        if (!taskExists) {
          // If the task doesn't exist, add it to the tasks array
          await db.collection('weeklyProgress').updateOne(
            {
              classroomId: new ObjectId(classroomId),
              weekNumber: parseInt(weekNumber),
            },
            {
              $push: {
                tasks: { taskId: parseInt(taskId), completedBy: [username] },
              },
              $set: { updatedAt: new Date() },
            }
          )
        } else {
          // If the task exists, update the completedBy array
          await db.collection('weeklyProgress').updateOne(
            {
              classroomId: new ObjectId(classroomId),
              weekNumber: parseInt(weekNumber),
              'tasks.taskId': parseInt(taskId),
            },
            {
              $addToSet: { 'tasks.$.completedBy': username },
              $set: { updatedAt: new Date() },
            }
          )
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in code submission:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}
