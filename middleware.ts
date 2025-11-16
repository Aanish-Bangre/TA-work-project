import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/jwt'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/students']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'))

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected routes - check for valid token
  if (!token) {
    // Allow initial access to dashboard routes - client-side will handle auth check
    // This prevents redirect loop when cookie is being set
    console.log('No token found in middleware, but allowing access for client-side check')
    return NextResponse.next()
  }

  const payload = verifyToken(token)

  if (!payload) {
    // Invalid token, redirect to login
    console.log('Invalid token, redirecting to login')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Check role-based access
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    console.log('Admin route but not admin role, redirecting')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/coordinator') && payload.role !== 'coordinator') {
    console.log('Coordinator route but not coordinator role, redirecting')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('Valid token, allowing access')
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only protect API routes for now, let client-side handle dashboard protection
    '/api/:path*',
  ],
}
