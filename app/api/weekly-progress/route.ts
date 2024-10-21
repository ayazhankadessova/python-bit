import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const { classroomId, weekNumber } = await request.json()

    if (!classroomId || !weekNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newWeeklyProgress = {
      classroomId: new ObjectId(classroomId),
      weekNumber,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db
      .collection('weeklyProgress')
      .insertOne(newWeeklyProgress)

    // Update the classroom with the new weekly progress ID
    await db
      .collection('classrooms')
      .updateOne(
        { _id: new ObjectId(classroomId) },
        { $set: { [`weeks.${weekNumber}`]: result.insertedId.toString() } }
      )

    return NextResponse.json(
      { ...newWeeklyProgress, _id: result.insertedId },
      { status: 201 }
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error creating weekly progress' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classroomId = searchParams.get('classroomId')
  const weekNumber = searchParams.get('weekNumber')

  if (!classroomId || !weekNumber) {
    return NextResponse.json(
      { message: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    let weeklyProgress = await db.collection('weeklyProgress').findOne({
      classroomId: new ObjectId(classroomId),
      weekNumber: parseInt(weekNumber),
    })

    if (!weeklyProgress) {
      // If weeklyProgress doesn't exist, create it
      const newWeeklyProgress = {
        classroomId: new ObjectId(classroomId),
        weekNumber: parseInt(weekNumber),
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db
        .collection('weeklyProgress')
        .insertOne(newWeeklyProgress)

      // Update the classroom with the new weekly progress ID
      await db
        .collection('classrooms')
        .updateOne(
          { _id: new ObjectId(classroomId) },
          { $set: { [`weeks.${weekNumber}`]: result.insertedId.toString() } }
        )

      weeklyProgress = { ...newWeeklyProgress, _id: result.insertedId }
    }

    return NextResponse.json(weeklyProgress)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error fetching or creating weekly progress' },
      { status: 500 }
    )
  }
}
