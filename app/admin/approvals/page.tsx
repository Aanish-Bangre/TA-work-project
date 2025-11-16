'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ChangeRequest {
  id: string
  coordinator_name: string
  student_seat_no: string
  student_name: string
  changes: string
  document_type: string
  status: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  faculty_comment?: string
}

export default function AdminApprovalsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null)
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(userData)
    if (parsed.role !== 'admin') {
      router.push('/login')
      return
    }
    setUser(parsed)
    fetchChangeRequests()
  }, [router])

  const fetchChangeRequests = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/change-requests?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setRequests(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch change requests')
      }
    } catch (err) {
      setError('An error occurred while fetching change requests')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (request: ChangeRequest) => {
    setSelectedRequest(request)
    setComment('')
    setReviewDialogOpen(true)
  }

  const handleApproveReject = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/change-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          status,
          faculty_comment: comment
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Change request ${status} successfully!`)
        setReviewDialogOpen(false)
        setSelectedRequest(null)
        setComment('')
        fetchChangeRequests() // Refresh list
      } else {
        alert(result.error || `Failed to ${status} change request`)
      }
    } catch (err) {
      alert(`An error occurred while processing the request`)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-lg">Loading change requests...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Review and approve/reject change requests from coordinators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-500 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No pending change requests.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Student Seat No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.coordinator_name}</TableCell>
                      <TableCell>{request.student_seat_no}</TableCell>
                      <TableCell>{request.student_name}</TableCell>
                      <TableCell>{request.document_type}</TableCell>
                      <TableCell>{new Date(request.submitted_at).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewClick(request)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Change Request</DialogTitle>
            <DialogDescription>
              Review the proposed changes and approve or reject the request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coordinator</Label>
                  <Input value={selectedRequest.coordinator_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Input value={selectedRequest.document_type} disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Seat No</Label>
                  <Input value={selectedRequest.student_seat_no} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input value={selectedRequest.student_name} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Proposed Changes</Label>
                <div className="rounded-md border p-4 bg-muted space-y-2">
                  {(() => {
                    const changes = JSON.parse(selectedRequest.changes)
                    const fieldLabels: { [key: string]: string } = {
                      rslt: 'Result (RSLT)',
                      res: 'Result (RES)',
                      p1_cd: 'Paper 1 Code',
                      p1_t: 'Paper 1 Theory',
                      p1_t_rm: 'Paper 1 Theory Remarks',
                      p1_i: 'Paper 1 Internal',
                      p1_i_rm: 'Paper 1 Internal Remarks',
                      p2_cd: 'Paper 2 Code',
                      p2_t: 'Paper 2 Theory',
                      p2_t_rm: 'Paper 2 Theory Remarks',
                      p2_i: 'Paper 2 Internal',
                      p2_i_rm: 'Paper 2 Internal Remarks',
                      p3_cd: 'Paper 3 Code',
                      p3_t: 'Paper 3 Theory',
                      p3_t_rm: 'Paper 3 Theory Remarks',
                      p3_i: 'Paper 3 Internal',
                      p3_i_rm: 'Paper 3 Internal Remarks',
                      p4_cd: 'Paper 4 Code',
                      p4_t: 'Paper 4 Theory',
                      p4_t_rm: 'Paper 4 Theory Remarks',
                      p4_i: 'Paper 4 Internal',
                      p4_i_rm: 'Paper 4 Internal Remarks',
                      p5_cd: 'Paper 5 Code',
                      p5_t: 'Paper 5 Theory',
                      p5_t_rm: 'Paper 5 Theory Remarks',
                      p5_i: 'Paper 5 Internal',
                      p5_i_rm: 'Paper 5 Internal Remarks',
                      p6_cd: 'Paper 6 Code',
                      p6_t: 'Paper 6 Theory',
                      p6_t_rm: 'Paper 6 Theory Remarks',
                      p6_i: 'Paper 6 Internal',
                      p6_i_rm: 'Paper 6 Internal Remarks',
                      c1: 'Credit 1',
                      sgp1: 'SGP 1',
                      s1c1: 'S1C1',
                      c2: 'Credit 2',
                      sgp2: 'SGP 2',
                      s2c2: 'S2C2',
                      c3: 'Credit 3',
                      sgp3: 'SGP 3',
                      s3c3: 'S3C3',
                      c4: 'Credit 4',
                      sgp4: 'SGP 4',
                      s4c4: 'S4C4',
                      c5: 'Credit 5',
                      sgp5: 'SGP 5',
                      s5c5: 'S5C5',
                      c6: 'Credit 6',
                      sgp6: 'SGP 6',
                      s6c6: 'S6C6',
                      cgpa: 'CGPA',
                      gcgpa: 'Grade CGPA',
                      frem: 'FREM',
                      seat_no: 'Seat Number',
                      coll_no: 'College Number',
                      name: 'Name',
                      sex: 'Sex',
                      session: 'Session'
                    }
                    
                    return Object.entries(changes).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1 border-b last:border-b-0">
                        <span className="font-medium text-sm">{fieldLabels[key] || key}:</span>
                        <span className="text-sm">{value as string}</span>
                      </div>
                    ))
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Input
                  id="comment"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApproveReject('rejected')}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Reject'}
            </Button>
            <Button
              onClick={() => handleApproveReject('approved')}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
