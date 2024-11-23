// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { z } from 'zod'
import { createToken } from '@/lib/auth'

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)
const JWT_SECRET = process.env.JWT_SECRET!

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// app/api/auth/login/route.ts
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const client = await clientPromise
    const db = client.db('pythonbit')

    const user = await db.collection('users').findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create token with both _id and role
    const token = await createToken({
      _id: user._id.toString(),
      role: user.role,
    })

    console.log('Created token for user:', {
      userId: user._id.toString(),
      role: user.role,
      token,
    })

    return NextResponse.json({ token, user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
