// lib/auth.ts
import { NextRequest } from 'next/server'
import * as jose from 'jose'
import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'
import { User } from '@/models/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

interface DecodedToken {
  userId: string
  email: string
  role: string
}

/**
 * Get token from authorization header
 */
function getTokenFromHeader(request: Request | NextRequest): string | null {
  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization')
  console.log('Auth header:', authHeader) // Debug log
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Create a new JWT token
 */
export async function createToken(user: {
  _id: string
  role: string
}): Promise<string> {
  const token = await new jose.SignJWT({
    sub: user._id,
    role: user.role, // Make sure role is included in the token
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
  return token
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(
  token: string
): Promise<jose.JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    console.log('Token payload:', payload) // Debug log
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Get user from database using token
 */
export async function getUser(
  request: Request | NextRequest
): Promise<User | null> {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      console.log('No token found') // Debug log
      return null
    }

    const payload = await verifyToken(token)
    if (!payload?.sub) {
      console.log('Invalid token payload') // Debug log
      return null
    }

    const client = await clientPromise
    const db = client.db('pythonbit')

    const user = await db.collection('users').findOne({
      _id: new ObjectId(payload.sub as string),
    })

    console.log('Found user:', user) // Debug log

    if (!user) {
      console.log('No user found in database') // Debug log
      return null
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      school: user.school,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...(user.role === 'teacher'
        ? { classrooms: user.classrooms || [] }
        : { classrooms: user.classrooms || [] }),
    } as User
  } catch (error) {
    console.error('Error in getUser:', error)
    return null
  }
}

/**
 * Verify authentication and optionally check role
 */
export async function authenticateRequest(
  request: Request | NextRequest,
  requiredRole?: 'teacher' | 'student'
): Promise<{ user: User | null; error?: string }> {
  console.log('Authenticating request for role:', requiredRole) // Debug log

  const user = await getUser(request)
  console.log('Retrieved user:', user) // Debug log

  if (!user) {
    return { user: null, error: 'Unauthorized' }
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`Role mismatch: expected ${requiredRole}, got ${user.role}`) // Debug log
    return { user: null, error: 'Insufficient permissions' }
  }

  return { user }
}

/**
 * Role check helper functions
 */
export function isTeacher(user: User | DecodedToken): boolean {
  return user.role === 'teacher'
}

export function isStudent(user: User | DecodedToken): boolean {
  return user.role === 'student'
}
