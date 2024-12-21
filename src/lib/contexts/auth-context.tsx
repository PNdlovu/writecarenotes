/**
 * WriteCareNotes.com
 * @fileoverview Authentication Context Provider
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { AuthService } from '../services/authService'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signIn: (email: string, password: string, region: string) => Promise<void>
  signUp: (formData: any) => Promise<void>
  signOut: () => Promise<void>
  sendMagicLink: (email: string, region: string) => Promise<void>
  verifyMagicLink: (token: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const authService = new AuthService()

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const session = await authService.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user session:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProfile(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(profile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  async function signIn(email: string, password: string, region: string) {
    try {
      const { user: authUser, profile: userProfile } = await authService.signIn({ email, password, region })
      setUser(authUser)
      setProfile(userProfile)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  async function signUp(formData: any) {
    try {
      await authService.signUp(formData)
      router.push('/verify-email')
    } catch (error) {
      throw error
    }
  }

  async function signOut() {
    try {
      await authService.signOut()
      setUser(null)
      setProfile(null)
      router.push('/')
    } catch (error) {
      throw error
    }
  }

  async function sendMagicLink(email: string, region: string) {
    try {
      await authService.sendMagicLink({ email, region })
    } catch (error) {
      throw error
    }
  }

  async function verifyMagicLink(token: string) {
    try {
      await authService.verifyMagicLink(token)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  async function resetPassword(email: string) {
    try {
      await authService.resetPassword(email)
    } catch (error) {
      throw error
    }
  }

  async function updatePassword(password: string) {
    try {
      await authService.updatePassword(password)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    sendMagicLink,
    verifyMagicLink,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 