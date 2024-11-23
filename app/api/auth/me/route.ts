// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(req)

    if (error || !user) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Remove sensitive fields and format response
    const safeUser = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      school: user.school,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...(user.role === 'teacher'
        ? {
            classrooms: user.classrooms || [],
          }
        : {
            classrooms: user.classrooms || [],
          }),
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
