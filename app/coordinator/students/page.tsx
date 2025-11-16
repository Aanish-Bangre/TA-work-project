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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Student {
  id: string
  seat_no: string
  name: string
  session: string
  rslt?: string
  res?: string
  [key: string]: any
}

export default function CoordinatorStudentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editedData, setEditedData] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  
  // Search filters
  const [searchSession, setSearchSession] = useState<string>('')
  const [searchSeatNo, setSearchSeatNo] = useState<string>('')
  const [availableSessions, setAvailableSessions] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(userData)
    if (parsed.role !== 'coordinator') {
      router.push('/login')
      return
    }
    setUser(parsed)
    fetchStudents()
  }, [router])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        const data = result.data || []
        setStudents(data)
        setFilteredStudents([]) // Don't show data initially
        
        // Extract unique sessions for dropdown
        const sessions = Array.from(new Set(data.map((s: Student) => s.session).filter(Boolean)))
        setAvailableSessions(sessions as string[])
      } else {
        setError(result.error || 'Failed to fetch students')
      }
    } catch (err) {
      setError('An error occurred while fetching students')
    } finally {
      setLoading(false)
    }
  }

  // Filter students based on search criteria
  const handleSearch = () => {
    let filtered = students

    if (searchSession) {
      filtered = filtered.filter(student => student.session === searchSession)
    }

    if (searchSeatNo.trim()) {
      filtered = filtered.filter(student => 
        student.seat_no.toLowerCase().includes(searchSeatNo.toLowerCase())
      )
    }

    setFilteredStudents(filtered)
    setHasSearched(true)
  }

  // Reset search filters
  const handleReset = () => {
    setSearchSession('')
    setSearchSeatNo('')
    setFilteredStudents([])
    setHasSearched(false)
  }

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student)
    // Initialize with current RLE/RPV values (or whatever fields you want to edit)
    setEditedData({
      // Add the fields that coordinators can edit
      // Based on your schema, these might be RLE/RPV status fields
    })
    setEditDialogOpen(true)
  }

  const handleSubmitChangeRequest = async () => {
    if (!selectedStudent) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_seat_no: selectedStudent.seat_no,
          student_name: selectedStudent.name,
          changes: editedData,
          document_type: 'RLE/RPV' // or get from form
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Change request submitted successfully!')
        setEditDialogOpen(false)
        setSelectedStudent(null)
        setEditedData({})
      } else {
        alert(result.error || 'Failed to submit change request')
      }
    } catch (err) {
      alert('An error occurred while submitting change request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-lg">Loading students...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>My Students</CardTitle>
          <CardDescription>
            View and edit student records. Changes will be sent to faculty admin for approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-500 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Search Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Select value={searchSession} onValueChange={setSearchSession}>
                  <SelectTrigger id="session">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSessions.map((session) => (
                      <SelectItem key={session} value={session}>
                        {session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seatNo">Seat Number</Label>
                <Input
                  id="seatNo"
                  placeholder="Enter seat number"
                  value={searchSeatNo}
                  onChange={(e) => setSearchSeatNo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  Search
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {!hasSearched ? (
            <p className="text-center text-muted-foreground py-8">
              Please select a session and/or enter a seat number, then click Search to view student records.
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No students match your search criteria. Please try different search parameters.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{student.name}</CardTitle>
                        <CardDescription>
                          Seat No: {student.seat_no} | Session: {student.session || 'N/A'}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEditClick(student)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Basic Information Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Basic Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">College Number</p>
                            <p className="font-medium">{student.coll_no || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium">{student.sex || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Final Result</p>
                            <Badge variant={student.rslt === 'PASS' ? 'default' : 'destructive'}>
                              {student.rslt || 'N/A'}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Result Status</p>
                            <p className="font-medium">{student.res || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Papers Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Course Papers & Marks</h3>
                        <div className="space-y-4">
                          {/* Paper 1 */}
                          {student.p1_cd && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                              <h4 className="font-semibold mb-3 text-base">Paper 1: {student.p1_cd}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Marks</p>
                                  <p className="font-medium text-lg">{student.p1_t || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Remarks</p>
                                  <p className="font-medium">{student.p1_t_rm || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Marks</p>
                                  <p className="font-medium text-lg">{student.p1_i || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Remarks</p>
                                  <p className="font-medium">{student.p1_i_rm || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Paper 2 */}
                          {student.p2_cd && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                              <h4 className="font-semibold mb-3 text-base">Paper 2: {student.p2_cd}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Marks</p>
                                  <p className="font-medium text-lg">{student.p2_t || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Remarks</p>
                                  <p className="font-medium">{student.p2_t_rm || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Marks</p>
                                  <p className="font-medium text-lg">{student.p2_i || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Remarks</p>
                                  <p className="font-medium">{student.p2_i_rm || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Paper 3 */}
                          {student.p3_cd && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                              <h4 className="font-semibold mb-3 text-base">Paper 3: {student.p3_cd}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Marks</p>
                                  <p className="font-medium text-lg">{student.p3_t || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Remarks</p>
                                  <p className="font-medium">{student.p3_t_rm || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Marks</p>
                                  <p className="font-medium text-lg">{student.p3_i || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Remarks</p>
                                  <p className="font-medium">{student.p3_i_rm || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Paper 4 */}
                          {student.p4_cd && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                              <h4 className="font-semibold mb-3 text-base">Paper 4: {student.p4_cd}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Marks</p>
                                  <p className="font-medium text-lg">{student.p4_t || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Remarks</p>
                                  <p className="font-medium">{student.p4_t_rm || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Marks</p>
                                  <p className="font-medium text-lg">{student.p4_i || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Remarks</p>
                                  <p className="font-medium">{student.p4_i_rm || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Paper 5 */}
                          {student.p5_cd && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                              <h4 className="font-semibold mb-3 text-base">Paper 5: {student.p5_cd}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Marks</p>
                                  <p className="font-medium text-lg">{student.p5_t || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Remarks</p>
                                  <p className="font-medium">{student.p5_t_rm || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Marks</p>
                                  <p className="font-medium text-lg">{student.p5_i || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Remarks</p>
                                  <p className="font-medium">{student.p5_i_rm || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Paper 6 */}
                          {student.p6_cd && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                              <h4 className="font-semibold mb-3 text-base">Paper 6: {student.p6_cd}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Marks</p>
                                  <p className="font-medium text-lg">{student.p6_t || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Theory Remarks</p>
                                  <p className="font-medium">{student.p6_t_rm || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Marks</p>
                                  <p className="font-medium text-lg">{student.p6_i || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Internal Remarks</p>
                                  <p className="font-medium">{student.p6_i_rm || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Credits and Grade Points Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Semester Credits & Grade Points</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <div key={sem} className="rounded-lg border p-3 bg-muted/30">
                              <p className="text-xs text-muted-foreground mb-2">Semester {sem}</p>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm">Credits:</span>
                                  <span className="font-semibold">{student[`c${sem}`] || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">SGP:</span>
                                  <span className="font-semibold">{student[`sgp${sem}`] || '-'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Overall Performance Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Overall Performance</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="rounded-lg border p-4 bg-primary/5">
                            <p className="text-sm text-muted-foreground mb-1">CGPA</p>
                            <p className="text-2xl font-bold">{student.cgpa || 'N/A'}</p>
                          </div>
                          <div className="rounded-lg border p-4 bg-primary/5">
                            <p className="text-sm text-muted-foreground mb-1">Grade CGPA</p>
                            <p className="text-2xl font-bold">{student.gcgpa || 'N/A'}</p>
                          </div>
                          <div className="rounded-lg border p-4 bg-primary/5">
                            <p className="text-sm text-muted-foreground mb-1">FREM</p>
                            <p className="text-2xl font-bold">{student.frem || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Record</DialogTitle>
            <DialogDescription>
              Edit semester credits and SGPs. Your request will be sent to the faculty admin for approval.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-4">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Seat No</Label>
                  <Input value={selectedStudent.seat_no} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input value={selectedStudent.name} disabled />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Session</Label>
                <Input value={selectedStudent.session || 'N/A'} disabled />
              </div>
              
              {/* RLE/RPV Status */}
              <div>
                <h3 className="text-sm font-semibold mb-3 pb-2 border-b">RLE/RPV Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rslt">Result (RSLT)</Label>
                    <Input
                      id="rslt"
                      placeholder="Enter RSLT value"
                      value={editedData.rslt !== undefined ? editedData.rslt : selectedStudent.rslt || ''}
                      onChange={(e) => setEditedData({ ...editedData, rslt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="res">Result (RES)</Label>
                    <Select
                      value={editedData.res !== undefined ? editedData.res : selectedStudent.res || ''}
                      onValueChange={(value) => setEditedData({ ...editedData, res: value })}
                    >
                      <SelectTrigger id="res">
                        <SelectValue placeholder="Select RLE or RPV" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RLE">RLE</SelectItem>
                        <SelectItem value="RPV">RPV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Credits and SGPs */}
              <div>
                <h3 className="text-sm font-semibold mb-3 pb-2 border-b">Semester Credits & Grade Points</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <div key={sem} className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">Semester {sem}</p>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor={`c${sem}`} className="text-xs">Credits (C{sem})</Label>
                          <Input
                            id={`c${sem}`}
                            placeholder={`C${sem}`}
                            value={editedData[`c${sem}`] !== undefined ? editedData[`c${sem}`] : selectedStudent[`c${sem}`] || ''}
                            onChange={(e) => setEditedData({ ...editedData, [`c${sem}`]: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`sgp${sem}`} className="text-xs">SGP (SGP{sem})</Label>
                          <Input
                            id={`sgp${sem}`}
                            placeholder={`SGP${sem}`}
                            value={editedData[`sgp${sem}`] !== undefined ? editedData[`sgp${sem}`] : selectedStudent[`sgp${sem}`] || ''}
                            onChange={(e) => setEditedData({ ...editedData, [`sgp${sem}`]: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitChangeRequest}
              disabled={submitting || Object.keys(editedData).length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
