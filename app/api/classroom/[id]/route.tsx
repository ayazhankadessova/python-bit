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

// // GET: Retrieve a specific classroom
// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id
//   if (!isValidObjectId(id)) {
//     return NextResponse.json(
//       { message: 'Invalid classroom ID' },
//       { status: 400 }
//     )
//   }

//   const client = await clientPromise
//   const db = client.db('pythonbit')

//   try {
//     const classroom = await db
//       .collection('classrooms')
//       .findOne({ _id: new ObjectId(id) })
//     if (!classroom) {
//       return NextResponse.json(
//         { message: 'Classroom not found' },
//         { status: 404 }
//       )
//     }
//     return NextResponse.json(classroom)
//   } catch (error) {
//     return NextResponse.json(
//       { message: 'Error retrieving classroom', error },
//       { status: 500 }
//     )
//   }
// }

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

    const result = await db
      .collection('classrooms')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Classroom not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Classroom updated successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating classroom', error },
      { status: 500 }
    )
  }
}

// DELETE: Delete a specific classroom
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
    const result = await db
      .collection('classrooms')
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Classroom not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Classroom deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting classroom', error },
      { status: 500 }
    )
  }
}
