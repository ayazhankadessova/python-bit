import { authenticateRequest } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { user, error } = await authenticateRequest(request, 'student')

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db('pythonbit')

    // Find classroom by code
    const classroom = await db.collection('classrooms').findOne({
      classCode: params.code.toUpperCase(),
    })

    if (!classroom) {
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      )
    }

    // Check if student is already enrolled
    if (classroom.students.some((id: ObjectId) => id.toString() === user._id)) {
      return NextResponse.json(
        { error: 'Already enrolled in this classroom' },
        { status: 400 }
      )
    }

    // Add student to classroom
    await db.collection('classrooms').updateOne(
      { _id: classroom._id },
      {
        $addToSet: { students: new ObjectId(user._id) },
        $set: { updatedAt: new Date() },
      }
    )

    // Add classroom to student's classrooms
    await db.collection('users').updateOne(
      { _id: new ObjectId(user._id) },
      {
        $addToSet: { classrooms: classroom._id },
        $set: { updatedAt: new Date() },
      }
    )

    return NextResponse.json({
      message: 'Successfully joined classroom',
      classroomId: classroom._id.toString(),
    })
  } catch (error) {
    console.error('Error joining classroom:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
