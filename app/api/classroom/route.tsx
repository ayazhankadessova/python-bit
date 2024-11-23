// app/api/classroom/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authenticateRequest } from '@/lib/auth'
import { generateUniqueClassCode } from '@/lib/generateClassCode'

// app/api/classroom/route.ts
export async function GET(req: NextRequest) {
  try {
    console.log('Request headers:', Object.fromEntries(req.headers)) // Debug log

    const { user, error } = await authenticateRequest(req, 'teacher')
    console.log('Auth result:', { user, error }) // Debug log

    if (error || !user) {
      console.log('Authentication failed:', error)
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get('teacherId')
    console.log('Teacher ID:', teacherId) // Debug log

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('pythonbit')

    const classrooms = await db
      .collection('classrooms')
      .find({ teacherId: new ObjectId(teacherId) })
      .toArray()

    console.log('Found classrooms:', classrooms) // Debug log

    const formattedClassrooms = classrooms.map((classroom) => ({
      ...classroom,
      _id: classroom._id.toString(),
      teacherId: classroom.teacherId.toString(),
      curriculumId: classroom.curriculumId.toString(),
    }))

    return NextResponse.json(formattedClassrooms)
  } catch (error) {
    console.error('Error in GET /api/classroom:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify auth token and check if user is a teacher
    const { user, error } = await authenticateRequest(req, 'teacher')
    console.log('Teacher user:', user)
    console.log('Auth error:', error)

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, teacherId, curriculumId, curriculumName, students } = body

    // Verify that the requesting user is the same as the teacherId
    if (teacherId !== user._id) {
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

    // Generate unique classroom code
    const classCode = await generateUniqueClassCode(db)

    // Create new classroom with classCode
    const classroom = await db.collection('classrooms').insertOne({
      name,
      teacherId: new ObjectId(teacherId),
      curriculumId: new ObjectId(curriculumId),
      curriculumName,
      students: students || [],
      lastTaughtWeek: 0,
      classCode,
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

    // Update each student's enrolledClassrooms array
    if (students && students.length > 0) {
      const updatePromises = students.map((studentId: string) =>
        db.collection('users').updateOne(
          {
            _id: new ObjectId(studentId),
            role: 'student',
          },
          {
            $push: {
              classrooms: classroom.insertedId,
            },
            $set: {
              updatedAt: new Date(),
            },
          }
        )
      )

      await Promise.all(updatePromises)
    }

    // Log the successful creation
    console.log('Created classroom:', {
      classroomId: classroom.insertedId,
      code: classCode,
      studentsAdded: students?.length || 0,
    })

    return NextResponse.json({
      _id: classroom.insertedId,
      name,
      teacherId,
      curriculumId,
      curriculumName,
      students,
      lastTaughtWeek: 0,
      classCode,
    })
  } catch (error) {
    console.error('Error creating classroom:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 500 }
      )
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
