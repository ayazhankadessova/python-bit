// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of image content types we want to cache
const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]

// Function to handle caching headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check if the request is for an image in the public folder
  if (
    request.nextUrl.pathname.startsWith('/themes/') &&
    IMAGE_TYPES.some((type) => request.headers.get('accept')?.includes(type))
  ) {
    // Set caching headers
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable') // 1 year
    response.headers.set(
      'CDN-Cache-Control',
      'public, max-age=31536000, immutable'
    )
    response.headers.set(
      'Vercel-CDN-Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  return response
}

// Only run middleware on image routes
export const config = {
  matcher: '/themes/:path*',
}
