// middleware/auth.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jwt from 'jsonwebtoken'

// Paths that don't require authentication
const publicPaths = [
  '/api/auth/login',
  '/api/auth/signup',
  '/login',
  '/signup',
  '/',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!)
      return NextResponse.next()
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }

  // Handle page routes
  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
