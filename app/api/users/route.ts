import { NextResponse, NextRequest } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { User } from '@/models/types'
import { ObjectId } from 'mongodb'

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const { id, username, email, password, role } = await request.json()

    if (!id || !username || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newUser: Omit<User, '_id'> = {
      id,
      username,
      email,
      password,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('users').insertOne(newUser)

    const createdUser: User = {
      ...newUser,
      _id: result.insertedId.toString(),
    }

    return NextResponse.json(createdUser, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    )
  }
}

// GET: Retrieve all users
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const school = searchParams.get('school')

    // Build the query filter
    const filter: { role?: string; school?: string } = {}

    if (role) {
      filter.role = role
    }

    if (school) {
      filter.school = school
    }

    const client = await clientPromise
    const db = client.db('pythonbit')

    // Apply the filters to the database query
    const users = await db.collection('users').find(filter).toArray()

    return NextResponse.json(users)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error retrieving users' },
      { status: 500 }
    )
  }
}

// PUT: Update a user
export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'Missing user ID' }, { status: 400 })
    }

    const result = await db
      .collection('users')
      .updateOne(
        { id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error updating user' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a user
export async function DELETE(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('pythonbit')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Missing user ID' }, { status: 400 })
    }

    const result = await db
      .collection('users')
      .deleteOne({ id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Error deleting user' },
      { status: 500 }
    )
  }
}
