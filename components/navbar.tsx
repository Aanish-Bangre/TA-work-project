"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ModeToggle } from "./theme-toggle"
import { Button } from "./ui/button"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check for user in localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Listen for storage changes (for logout in other tabs)
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user')
      setUser(userData ? JSON.parse(userData) : null)
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-tab updates
    window.addEventListener('userLogin' as any, handleStorageChange)
    window.addEventListener('userLogout' as any, handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userLogin' as any, handleStorageChange)
      window.removeEventListener('userLogout' as any, handleStorageChange)
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('user')
      localStorage.removeItem('auth-token')
      setUser(null)
      window.dispatchEvent(new Event('userLogout'))
      router.push('/login')
    }
  }

  const getDepartmentLabel = (dept: string) => {
    const labels: { [key: string]: string } = {
      science: 'Science & Tech',
      commerce: 'Commerce',
      interdisciplinary: 'Interdisciplinary',
      humanities: 'Humanities'
    }
    return labels[dept] || dept
  }

  // Hide navbar on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Form Builder</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">{user.username}</span>
                {user.department && (
                  <span className="text-muted-foreground">
                    ({getDepartmentLabel(user.department)})
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}
