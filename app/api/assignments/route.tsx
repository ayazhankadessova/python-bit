import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

// POST: Create a new assignment
export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { name, topic, tasks } = await request.json()

    if (!name || !topic || !tasks || tasks.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newAssignment = {
      name,
      topic,
      tasks,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('assignments').insertOne(newAssignment)
    const createdAssignment = {
      ...newAssignment,
      _id: result.insertedId.toString(),
    }

    return NextResponse.json(createdAssignment, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error creating assignment' },
      { status: 500 }
    )
  }
}

// GET: Retrieve assignments
export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const assignment = await db
        .collection('assignments')
        .findOne({ _id: new ObjectId(id) })
      if (!assignment) {
        return NextResponse.json(
          { message: 'Assignment not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(assignment)
    }

    const assignments = await db.collection('assignments').find().toArray()
    return NextResponse.json(assignments)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error retrieving assignments' },
      { status: 500 }
    )
  }
}

// PUT: Update an assignment (e.g., provide feedback and score)
export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { _id, feedback, score } = await request.json()

    if (!_id) {
      return NextResponse.json(
        { message: 'Missing assignment ID' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('assignments')
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { feedback, score, updatedAt: new Date() } }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Assignment updated successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error updating assignment' },
      { status: 500 }
    )
  }
}

// DELETE: Delete an assignment
export async function DELETE(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Missing assignment ID' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('assignments')
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Assignment deleted successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error deleting assignment' },
      { status: 500 }
    )
  }
}
