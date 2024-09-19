// app/api/classroom/[id]/invite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  try {
    const client = await clientPromise
    const db = client.db('pythonbit')
    const classroom = await db
      .collection('classrooms')
      .findOne({ _id: new ObjectId(id) })

    if (!classroom) {
      return NextResponse.json(
        { message: 'Classroom not found' },
        { status: 404 }
      )
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${id}`

    await db
      .collection('classrooms')
      .updateOne({ _id: new ObjectId(id) }, { $set: { inviteLink } })

    return NextResponse.json({ inviteLink }, { status: 200 })
  } catch (error) {
    console.error('Error generating invite link:', error)
    return NextResponse.json(
      { message: 'Error generating invite link' },
      { status: 500 }
    )
  }
}
