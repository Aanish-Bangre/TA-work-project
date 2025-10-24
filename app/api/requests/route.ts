import { NextRequest, NextResponse } from 'next/server';
import { 
  createChangeRequest, 
  getAllChangeRequests, 
  getPendingRequests,
  getRequestsByTeacher,
  updateRequestStatus 
} from '@/lib/requests';

// GET - Fetch change requests
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teacherId = searchParams.get('teacherId');
  const status = searchParams.get('status');

  try {
    let requests;

    if (teacherId) {
      requests = getRequestsByTeacher(teacherId);
    } else if (status === 'pending') {
      requests = getPendingRequests();
    } else {
      requests = getAllChangeRequests();
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create new change request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, teacherName, studentSeatNo, studentName, changes } = body;

    if (!teacherId || !studentSeatNo || !changes || changes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newRequest = createChangeRequest({
      teacherId,
      teacherName,
      studentSeatNo,
      studentName,
      changes
    });

    return NextResponse.json({
      success: true,
      request: newRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}

// PUT - Update request status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, status, reviewedBy, adminComment } = body;

    if (!requestId || !status || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedRequest = updateRequestStatus(requestId, status, reviewedBy, adminComment);

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
