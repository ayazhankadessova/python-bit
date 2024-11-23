// app/api/classroom/[id]/join/route.ts
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authenticateRequest } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and check if user is a student
    const { user, error } = await authenticateRequest(request, 'student')

    if (error || !user) {
      return NextResponse.json(
        { message: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db('pythonbit')

    // Check if classroom exists
    const classroom = await db.collection('classrooms').findOne({
      _id: new ObjectId(params.id),
    })

    if (!classroom) {
      return NextResponse.json(
        { message: 'Classroom not found' },
        { status: 404 }
      )
    }

    // Check if student is already in the classroom
    const isEnrolled = classroom.students?.some(
      (studentId: ObjectId) => studentId.toString() === user._id
    )

    if (isEnrolled) {
      return NextResponse.json(
        { message: 'Already enrolled in this classroom' },
        { status: 400 }
      )
    }

    // Add student to classroom's students array
    await db
      .collection('classrooms')
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $addToSet: { students: new ObjectId(user._id) } }
      )

    // Add classroom to student's classrooms array
    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(user._id) },
        { $addToSet: { classrooms: new ObjectId(params.id) } }
      )

    return NextResponse.json({
      message: 'Successfully joined classroom',
      classroomId: params.id,
    })
  } catch (error) {
    console.error('Error joining classroom:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
