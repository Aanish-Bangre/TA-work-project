'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CoordinatorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

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
  }, [router])

  if (!user) return null

  const departmentName = user.department ? 
    user.department.charAt(0).toUpperCase() + user.department.slice(1) : 
    'Unknown'

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.username}</CardTitle>
            <CardDescription>
              Role: Coordinator - {departmentName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You can submit data for approval by your department admin.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => router.push('/coordinator/students')}
              >
                Manage Students (RLE/RPV)
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => router.push('/coordinator/submissions')}
              >
                View My Submissions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
