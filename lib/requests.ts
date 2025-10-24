// Change request tracking
export interface ChangeRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  studentSeatNo: string;
  studentName: string;
  changes: ChangeLog[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminComment?: string;
}

export interface ChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
}

// In-memory storage (in production, use a database)
let changeRequests: ChangeRequest[] = [];

export function createChangeRequest(request: Omit<ChangeRequest, 'id' | 'status' | 'submittedAt'>): ChangeRequest {
  const newRequest: ChangeRequest = {
    ...request,
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  
  changeRequests.push(newRequest);
  return newRequest;
}

export function getAllChangeRequests(): ChangeRequest[] {
  return changeRequests;
}

export function getPendingRequests(): ChangeRequest[] {
  return changeRequests.filter(req => req.status === 'pending');
}

export function getRequestsByTeacher(teacherId: string): ChangeRequest[] {
  return changeRequests.filter(req => req.teacherId === teacherId);
}

export function getRequestById(id: string): ChangeRequest | null {
  return changeRequests.find(req => req.id === id) || null;
}

export function updateRequestStatus(
  id: string, 
  status: 'approved' | 'rejected', 
  reviewedBy: string,
  adminComment?: string
): ChangeRequest | null {
  const request = changeRequests.find(req => req.id === id);
  if (request) {
    request.status = status;
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = reviewedBy;
    request.adminComment = adminComment;
  }
  return request || null;
}
