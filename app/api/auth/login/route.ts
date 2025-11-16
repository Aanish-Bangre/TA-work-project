import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, role, department } = body

    // Validate required fields
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      )
    }

    // Build query based on role
    let query = supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('role', role)

    // If admin, department is required
    if (role === 'admin') {
      if (!department) {
        return NextResponse.json(
          { error: 'Department is required for admin' },
          { status: 400 }
        )
      }
      query = query.eq('department', department)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = data

    // Generate JWT token
    const token = generateToken({
      id: userData.id,
      username: userData.username,
      role: userData.role,
      department: userData.department
    })

    // Create response with token in cookie
    const response = NextResponse.json(
      { 
        success: true,
        user: userData,
        token,
        message: 'Login successful'
      },
      { status: 200 }
    )

    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
