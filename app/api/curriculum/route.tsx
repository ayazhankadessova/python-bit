import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

// POST: Create a new curriculum
export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { name, description, weeks } = await request.json()

    if (!name || !description || !weeks) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newCurriculum = {
      name,
      description,
      weeks: weeks.map((week) => ({
        weekNumber: week.weekNumber,
        topic: week.topic,
        assignmentId: new ObjectId(week.assignmentId),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('curricula').insertOne(newCurriculum)
    const createdCurriculum = {
      ...newCurriculum,
      _id: result.insertedId.toString(),
    }

    return NextResponse.json(createdCurriculum, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error creating curriculum' },
      { status: 500 }
    )
  }
}

// GET: Retrieve curricula
export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const curriculum = await db
        .collection('curricula')
        .findOne({ _id: new ObjectId(id) })
      if (!curriculum) {
        return NextResponse.json(
          { message: 'Curriculum not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(curriculum)
    }

    const curricula = await db.collection('curricula').find().toArray()
    return NextResponse.json(curricula)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error retrieving curricula' },
      { status: 500 }
    )
  }
}
// PUT: Update a curriculum
export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { _id, ...updateData } = await request.json()

    if (!_id) {
      return NextResponse.json(
        { message: 'Missing curriculum ID' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('curricula')
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Curriculum not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Curriculum updated successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error updating curriculum' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a curriculum
export async function DELETE(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Missing curriculum ID' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('curricula')
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Curriculum not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Curriculum deleted successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error deleting curriculum' },
      { status: 500 }
    )
  }
}
