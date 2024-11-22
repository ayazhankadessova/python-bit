// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { z } from 'zod'
import clientPromise from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2),
  role: z.enum(['teacher', 'student']),
  school: z.string().optional(),
  subject: z.string().optional(),
  grade: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const parsedBody = signupSchema.parse(body)
    const { email, password, username, role, school, subject, grade } =
      parsedBody

    const client = await clientPromise
    const db = client.db('pythonbit')
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user document based on role
    const baseUser = {
      email,
      password: hashedPassword,
      username,
      role,
      school,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const userDoc =
      role === 'teacher'
        ? {
            ...baseUser,
            subject,
            classrooms: [],
          }
        : {
            ...baseUser,
            grade,
            enrolledClassrooms: [],
          }

    // Insert user
    const result = await usersCollection.insertOne(userDoc)

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email,
        role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = userDoc

    return NextResponse.json({
      user: {
        _id: result.insertedId,
        ...userWithoutPassword,
      },
      token,
    })
  } catch (error) {
    console.error('Signup error:', error)
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
  }
}
