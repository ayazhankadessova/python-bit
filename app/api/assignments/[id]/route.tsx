// File: app/api/assignments/[id]/route.ts

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
      { message: 'Invalid assignment ID' },
      { status: 400 }
    )
  }

  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

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
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { message: 'Error fetching assignment' },
      { status: 500 }
    )
  }
}
