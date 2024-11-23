// File: /app/api/classroom/[id]/route.ts
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Helper function to check if the ID is valid
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id)
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'Invalid classroom ID' },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db('pythonbit')

  try {
    const classroom = await db
      .collection('classrooms')
      .findOne({ _id: new ObjectId(id) })

    if (!classroom) {
      return NextResponse.json(
        { message: 'Classroom not found' },
        { status: 404 }
      )
    }

    // Since the classroom structure doesn't have studentProgress,
    // we'll just return the classroom as is
    return NextResponse.json(classroom)
  } catch (error) {
    console.error('Error fetching classroom:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update a specific classroom
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { message: 'Invalid classroom ID' },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db('pythonbit')

  try {
    const updateData = await request.json()
    delete updateData._id // Ensure _id is not part of the update data

    const result = await db.collection('classrooms').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' } // This option returns the updated document
    )

    // if (result.matchedCount === 0) {
    //   return NextResponse.json(
    //     { message: 'Classroom not found' },
    //     { status: 404 }
    //   )
    // }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating classroom', error },
      { status: 500 }
    )
  }
}

// app/api/classroom/[id]/route.ts

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { message: 'Invalid classroom ID' },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db('pythonbit')

  try {
    // First get the classroom to find associated users
    const classroom = await db.collection('classrooms').findOne({
      _id: new ObjectId(id),
    })

    if (!classroom) {
      return NextResponse.json(
        { message: 'Classroom not found' },
        { status: 404 }
      )
    }

    // Start a session for transaction
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Delete the classroom
        await db
          .collection('classrooms')
          .deleteOne({ _id: new ObjectId(id) }, { session })

        // Remove classroom from teacher's array
        await db.collection('users').updateOne(
          { _id: classroom.teacherId },
          {
            $pull: { classrooms: new ObjectId(id) },
            $set: { updatedAt: new Date() },
          },
          { session }
        )

        // Remove classroom from all students' enrolledClassrooms array
        if (classroom.students && classroom.students.length > 0) {
          await db.collection('users').updateMany(
            {
              _id: {
                $in: classroom.students.map((id: string) => new ObjectId(id)),
              },
              role: 'student',
            },
            {
              $pull: { enrolledClassrooms: new ObjectId(id) },
              $set: { updatedAt: new Date() },
            },
            { session }
          )
        }

        // Optional: Delete any associated data (like progress records)
        await db
          .collection('weeklyProgress')
          .deleteMany({ classroomId: new ObjectId(id) }, { session })
      })

      await session.endSession()

      return NextResponse.json({
        message: 'Classroom and all associated data deleted successfully',
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error('Error deleting classroom:', error)
    return NextResponse.json(
      {
        message: 'Error deleting classroom',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
