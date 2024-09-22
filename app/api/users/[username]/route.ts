import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    // Get the username from the URL params
    const { username } = params

    // Find the user by the username field
    const user = await db.collection('users').findOne({ username: username })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (e) {
    console.error('Error retrieving user:', e)
    return NextResponse.json(
      { message: 'Error retrieving user' },
      { status: 500 }
    )
  }
}
