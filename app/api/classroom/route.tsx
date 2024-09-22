import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { Classroom } from '@/models/types'
import { ObjectId } from 'mongodb'

// POST: Create a new classroom
export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const { name, teacherId, curriculumId, curriculumName } =
      await request.json()

    if (!name || !teacherId || !curriculumId || !curriculumName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newClassroom: Omit<Classroom, '_id'> = {
      name,
      teacherId,
      curriculumId,
      curriculumName,
      lastTopic: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('classrooms').insertOne(newClassroom)

    const createdClassroom: Classroom = {
      ...newClassroom,
      _id: result.insertedId.toString(),
    }

    return NextResponse.json(createdClassroom, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error creating classroom' },
      { status: 500 }
    )
  }
}

// GET: Retrieve classrooms
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const classrooms = await db.collection('classrooms').find().toArray()

    return NextResponse.json(classrooms)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error retrieving classrooms' },
      { status: 500 }
    )
  }
}

// PUT: Update a classroom
export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const { _id, ...updateData } = await request.json()

    if (!_id) {
      return NextResponse.json(
        { message: 'Missing classroom ID' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('classrooms')
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Classroom not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Classroom updated successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error updating classroom' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a classroom
export async function DELETE(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Missing classroom ID' },
        { status: 400 }
      )
    }

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
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error deleting classroom' },
      { status: 500 }
    )
  }
}
