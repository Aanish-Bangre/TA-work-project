import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No token found' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        authenticated: true,
        user: payload
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Token verification failed' },
      { status: 500 }
    )
  }
}
