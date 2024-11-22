// app/api/classroom/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Verify auth token and check if user is a teacher
    const decoded = await verifyAuth(req)
    if (decoded.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can access classrooms' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get('teacherId')

    // Verify that the requesting user is the same as the teacherId
    if (teacherId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to classroom data' },
        { status: 403 }
      )
    }

    const client = await clientPromise
    const db = client.db('pythonbit')
    const classrooms = await db
      .collection('classrooms')
      .find({ teacherId: new ObjectId(teacherId) })
      .toArray()

    return NextResponse.json(classrooms)
  } catch (error) {
    console.error('Error fetching classrooms:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify auth token and check if user is a teacher
    const decoded = await verifyAuth(req)
    if (decoded.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can create classrooms' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, teacherId, curriculumId, curriculumName, students } = body

    // Verify that the requesting user is the same as the teacherId
    if (teacherId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Cannot create classroom for another teacher' },
        { status: 403 }
      )
    }

    if (!name || !teacherId || !curriculumId || !curriculumName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('pythonbit')

    // Create new classroom
    const classroom = await db.collection('classrooms').insertOne({
      name,
      teacherId: new ObjectId(teacherId),
      curriculumId: new ObjectId(curriculumId),
      curriculumName,
      students: students || [],
      lastTaughtWeek: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update teacher's classrooms array
    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(teacherId) },
        { $push: { classrooms: classroom.insertedId } }
      )

    return NextResponse.json({
      _id: classroom.insertedId,
      name,
      teacherId,
      curriculumId,
      curriculumName,
      students,
      lastTaughtWeek: 0,
    })
  } catch (error) {
    console.error('Error creating classroom:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
