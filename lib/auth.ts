// lib/auth.ts
import { NextRequest } from 'next/server'
import * as jwt from 'jsonwebtoken'

interface DecodedToken {
  userId: string
  email: string
  role: string
}

export async function verifyAuth(req: NextRequest): Promise<DecodedToken> {
  const token = req.headers.get('Authorization')?.split(' ')[1]

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
    return decoded
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function isTeacher(decodedToken: DecodedToken): boolean {
  return decodedToken.role === 'teacher'
}

export function isStudent(decodedToken: DecodedToken): boolean {
  return decodedToken.role === 'student'
}
