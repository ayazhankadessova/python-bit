import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'Invalid curriculum ID' },
      { status: 400 }
    )
  }

  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const curriculum = await db
      .collection('curricula')
      .findOne({ _id: new ObjectId(id) })

    if (!curriculum) {
      return NextResponse.json(
        { message: 'Curriculum not found' },
        { status: 404 }
      )
    }

    // Convert ObjectId to string for assignmentId
    const formattedCurriculum = {
      ...curriculum,
      weeks: curriculum.weeks.map((week: Week) => ({
        ...week,
        assignmentId: week.assignmentId.toString(),
      })),
    }

    return NextResponse.json(formattedCurriculum)
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return NextResponse.json(
      { message: 'Error fetching curriculum' },
      { status: 500 }
    )
  }
}
