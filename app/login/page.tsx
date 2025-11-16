'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type LoginStep = 'role-selection' | 'department-selection' | 'credentials'
type Role = 'admin' | 'coordinator'
type Department = 'science' | 'commerce' | 'interdisciplinary' | 'humanities'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>('role-selection')
  const [userType, setUserType] = useState<'admin' | 'coordinator' | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelection = (type: 'admin' | 'coordinator') => {
    setUserType(type)
    setError('')

    if (type === 'admin') {
      setStep('department-selection')
    } else {
      setRole('coordinator')
      setStep('credentials')
    }
  }

  const handleDepartmentSelection = (dept: Department) => {
    setDepartment(dept)
    setRole('admin')
    setError('')
    setStep('credentials')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Login attempt:', { username, role, department })

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role,
          department: role === 'admin' ? department : null,
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('Login successful, storing data...')
        
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('auth-token', data.token)
        
        console.log('Data stored:', {
          user: localStorage.getItem('user'),
          token: localStorage.getItem('auth-token')
        })
        
        console.log('Data stored, dispatching event...')
        
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('userLogin'))

        console.log('Redirecting to dashboard...')
        
        // Small delay to ensure localStorage is written
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Use window.location.href for hard redirect to ensure cookie is properly set
        // Redirect based on role
        if (data.user.role === 'admin') {
          console.log('Redirecting to admin dashboard')
          window.location.href = '/admin/dashboard'
        } else {
          console.log('Redirecting to coordinator dashboard')
          window.location.href = '/coordinator/dashboard'
        }
      } else {
        console.error('Login failed:', data.error)
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setError('')
    if (step === 'credentials') {
      if (userType === 'admin') {
        setStep('department-selection')
        setDepartment(null)
      } else {
        setStep('role-selection')
        setUserType(null)
      }
    } else if (step === 'department-selection') {
      setStep('role-selection')
      setUserType(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            {step === 'role-selection' && 'Select your user type'}
            {step === 'department-selection' && 'Select your department'}
            {step === 'credentials' && 'Enter your credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-500 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 'role-selection' && (
            <div className="space-y-4">
              <Button
                className="w-full h-20 text-lg"
                variant="outline"
                onClick={() => handleRoleSelection('admin')}
              >
                Admin Login
              </Button>
              <Button
                className="w-full h-20 text-lg"
                variant="outline"
                onClick={() => handleRoleSelection('coordinator')}
              >
                Coordinator Login
              </Button>
            </div>
          )}

          {/* Step 2: Department Selection (only for Admin) */}
          {step === 'department-selection' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Department</Label>
                <Select onValueChange={(value) => handleDepartmentSelection(value as Department)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="science">Science & Technology</SelectItem>
                    <SelectItem value="commerce">Commerce & Management</SelectItem>
                    <SelectItem value="interdisciplinary">Interdisciplinary</SelectItem>
                    <SelectItem value="humanities">Humanities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          )}

          {/* Step 3: Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {role === 'admin' && department && (
                <div className="text-sm text-muted-foreground">
                  Logging in as: <span className="font-medium">Admin - {department.charAt(0).toUpperCase() + department.slice(1)}</span>
                </div>
              )}

              {role === 'coordinator' && (
                <div className="text-sm text-muted-foreground">
                  Logging in as: <span className="font-medium">Coordinator</span>
                </div>
              )}

              <div className="flex flex-col space-y-5">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
