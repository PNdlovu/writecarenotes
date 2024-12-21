'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { SignUpFormData } from '@/lib/validations/auth'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  organization: string
  region: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string, region: string) => Promise<void>
  signUp: (data: SignUpFormData) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // TODO: Implement actual auth check
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const signIn = async (email: string, password: string, region: string) => {
    try {
      // TODO: Implement actual sign in
      const mockUser = {
        id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        organization: 'Care Home',
        region,
      }
      setUser(mockUser)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signUp = async (data: SignUpFormData) => {
    try {
      // TODO: Implement actual sign up
      const mockUser = {
        id: '1',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        organization: data.organization,
        region: data.region,
      }
      setUser(mockUser)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      // TODO: Implement actual sign out
      setUser(null)
      router.push('/')
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
