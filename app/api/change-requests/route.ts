import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/jwt'

// GET - Fetch change requests
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('change_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    // Filter by role
    if (payload.role === 'coordinator') {
      query = query.eq('coordinator_id', payload.id)
    } else if (payload.role === 'admin' && payload.department) {
      query = query.eq('faculty', payload.department)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching change requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch change requests' },
      { status: 500 }
    )
  }
}

// POST - Create new change request (Coordinator)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'coordinator') {
      return NextResponse.json({ error: 'Only coordinators can submit change requests' }, { status: 403 })
    }

    const body = await request.json()
    const { student_seat_no, student_name, changes, document_type } = body

    if (!student_seat_no || !changes) {
      return NextResponse.json(
        { error: 'Student seat number and changes are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('change_requests')
      .insert([
        {
          coordinator_id: payload.id,
          coordinator_name: payload.username,
          faculty: payload.department,
          student_seat_no,
          student_name,
          changes: JSON.stringify(changes),
          document_type,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, data, message: 'Change request submitted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating change request:', error)
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    )
  }
}

// PATCH - Update change request status (Admin approval/rejection)
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can approve/reject requests' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, faculty_comment } = body

    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid ID and status (approved/rejected) are required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: payload.username,
    }

    if (faculty_comment) {
      updateData.faculty_comment = faculty_comment
    }

    const { data, error } = await supabase
      .from('change_requests')
      .update(updateData)
      .eq('id', id)
      .eq('faculty', payload.department) // Ensure admin can only update their department's requests
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If approved, update the student record
    if (status === 'approved' && data) {
      try {
        const changes = JSON.parse(data.changes)
        await supabase
          .from('students')
          .update(changes)
          .eq('seat_no', data.student_seat_no) // Use seat_no column from students table
      } catch (updateError) {
        console.error('Error updating student record:', updateError)
      }
    }

    return NextResponse.json(
      { success: true, data, message: `Change request ${status} successfully` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating change request:', error)
    return NextResponse.json(
      { error: 'Failed to update change request' },
      { status: 500 }
    )
  }
}
