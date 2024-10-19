import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

// POST: Create a new submission
export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { classroomId, studentId, weekNumber, taskId, code } =
      await request.json()

    if (!classroomId || !studentId || !weekNumber || !taskId || !code) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newSubmission = {
      classroomId: new ObjectId(classroomId),
      studentId: new ObjectId(studentId),
      weekNumber,
      taskId,
      code,
      feedback: '',
      score: null,
      submittedAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('submissions').insertOne(newSubmission)
    const createdSubmission = {
      ...newSubmission,
      _id: result.insertedId.toString(),
    }

    return NextResponse.json(createdSubmission, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error creating submission' },
      { status: 500 }
    )
  }
}

// GET: Retrieve submissions
export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { searchParams } = new URL(request.url)
    const classroomId = searchParams.get('classroomId')
    const studentId = searchParams.get('studentId')
    const weekNumber = searchParams.get('weekNumber')

    let query = {}
    if (classroomId)
      query = { ...query, classroomId: new ObjectId(classroomId) }
    if (studentId) query = { ...query, studentId: new ObjectId(studentId) }
    if (weekNumber) query = { ...query, weekNumber: parseInt(weekNumber) }

    const submissions = await db.collection('submissions').find(query).toArray()
    return NextResponse.json(submissions)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error retrieving submissions' },
      { status: 500 }
    )
  }
}

// PUT: Update a submission (e.g., provide feedback and score)
export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { _id, feedback, score } = await request.json()

    if (!_id) {
      return NextResponse.json(
        { message: 'Missing submission ID' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('submissions')
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { feedback, score, updatedAt: new Date() } }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Submission updated successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error updating submission' },
      { status: 500 }
    )
  }
}
