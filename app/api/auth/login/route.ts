// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { z } from 'zod'

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)
const JWT_SECRET = process.env.JWT_SECRET!

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const parsedBody = loginSchema.parse(body)
    const { email, password } = parsedBody

    await client.connect()
    const db = client.db('pythonbit')
    const usersCollection = db.collection('users')

    // Find user by email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
