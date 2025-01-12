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



// // middleware.ts
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { auth } from 'firebase-admin'
// import { initAdmin } from './lib/firebase-admin'

// // Constants
// const ADMIN_EMAIL = 'kadessovaayazhan@gmail.com'
// const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

// // Initialize Firebase Admin if not initialized
// initAdmin()

// export async function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname

//   // Special handling for theme images
//   if (pathname.startsWith('/themes/')) {
//     const response = NextResponse.next()

//     if (
//       IMAGE_TYPES.some((type) => request.headers.get('accept')?.includes(type))
//     ) {
//       // Set caching headers for images
//       const cacheControl = 'public, max-age=31536000, immutable' // 1 year
//       response.headers.set('Cache-Control', cacheControl)
//       response.headers.set('CDN-Cache-Control', cacheControl)
//       response.headers.set('Vercel-CDN-Cache-Control', cacheControl)
//       return response
//     }
//   }

//   // Skip auth check for public routes
//   if (!shouldCheckAuth(pathname)) {
//     return NextResponse.next()
//   }

//   try {
//     // Get and verify session cookie
//     const sessionCookie = request.cookies.get('session')?.value
//     if (!sessionCookie) {
//       return redirectToLogin(request)
//     }

//     // Verify the session cookie and get the user
//     const decodedClaims = await auth().verifySessionCookie(sessionCookie, true)

//     // Check for admin routes
//     if (pathname.startsWith('/firestore-stuff')) {
//       if (decodedClaims.email !== ADMIN_EMAIL) {
//         return new NextResponse(null, {
//           status: 403,
//           statusText: 'Forbidden: Access restricted to admin only',
//         })
//       }
//     }

//     // Add user info to request headers
//     const requestHeaders = new Headers(request.headers)
//     requestHeaders.set('x-user-id', decodedClaims.uid)
//     requestHeaders.set('x-user-email', decodedClaims.email || '')
//     requestHeaders.set('x-user-role', decodedClaims.role || 'user')

//     // Continue with the request
//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     })
//   } catch (error) {
//     console.error('Middleware error:', error)
//     return redirectToLogin(request)
//   }
// }

// function shouldCheckAuth(pathname: string): boolean {
//   // Add paths that need authentication
//   const protectedPaths = ['/firestore-stuff', '/api', '/dashboard', '/profile']

//   // Add paths that should be public
//   const publicPaths = [
//     '/_next',
//     '/login',
//     '/signup',
//     '/reset-password',
//     '/favicon.ico',
//     '/themes',
//   ]

//   // Check if path should be protected
//   return (
//     protectedPaths.some((path) => pathname.startsWith(path)) &&
//     !publicPaths.some((path) => pathname.startsWith(path))
//   )
// }

// function redirectToLogin(request: NextRequest) {
//   const redirectUrl = new URL('/login', request.url)
//   redirectUrl.searchParams.set('from', request.nextUrl.pathname)
//   return NextResponse.redirect(redirectUrl)
// }

// // Configure which routes the middleware should run on
// export const config = {
//   matcher: [
//     // Protected admin routes
//     '/firestore-stuff/:path*',
//     // API routes
//     '/api/:path*',
//     // Theme routes
//     '/themes/:path*',
//     // Dashboard routes
//     '/dashboard/:path*',
//     // Profile routes
//     '/profile/:path*',
//   ],
// }
