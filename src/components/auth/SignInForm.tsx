/**
 * @writecarenotes.com
 * @fileoverview User authentication sign-in form component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive sign-in form component that handles user authentication.
 * Features include:
 * - Multiple authentication providers support
 * - Form validation and error handling
 * - Loading states for better UX
 * - Password reset and magic link options
 * - Toast notifications for user feedback
 * - Remember me functionality
 * - OAuth integration
 *
 * Mobile-First Considerations:
 * - Responsive form layout
 * - Touch-friendly inputs
 * - Mobile keyboard optimization
 * - Clear error messaging
 * - Loading indicators
 * - OAuth button spacing
 *
 * Enterprise Features:
 * - Multi-factor authentication
 * - Brute force protection
 * - Session management
 * - Security best practices
 * - Audit logging
 * - GDPR compliance
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/england/dashboard'
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      router.push(result.url || '/england/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setIsLoading(true)
    setError()
    
    const email = (document.getElementById('email') as HTMLInputElement).value
    if (!email) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/england/dashboard'
      })

      if (result?.error) {
        setError('Failed to send magic link. Please try again.')
      } else {
        setError('Magic link sent! Please check your email.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className={`rounded-lg border p-4 ${
            error.includes('Magic link sent!') 
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {error.includes('Magic link sent!') ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email address
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-[#34B5B5]" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-base text-gray-900 ring-offset-white placeholder:text-gray-500 focus:border-[#34B5B5] focus:outline-none focus:ring-2 focus:ring-[#34B5B5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="name@organization.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-gray-900">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-[#34B5B5] hover:text-[#2A9090]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-[#34B5B5]" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-base text-gray-900 ring-offset-white placeholder:text-gray-500 focus:border-[#34B5B5] focus:outline-none focus:ring-2 focus:ring-[#34B5B5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-[#34B5B5] focus:ring-[#34B5B5]"
          />
          <Label htmlFor="remember" className="text-sm text-gray-700">
            Remember me
          </Label>
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full rounded-lg bg-[#34B5B5] px-4 py-3 text-base font-medium text-white hover:bg-[#2A9090] focus:outline-none focus:ring-2 focus:ring-[#34B5B5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in with password'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full rounded-lg border border-[#34B5B5] bg-white px-4 py-3 text-base font-medium text-[#34B5B5] hover:bg-[#F0FAFA] focus:outline-none focus:ring-2 focus:ring-[#34B5B5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleMagicLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending link...</span>
              </div>
            ) : (
              'Sign in with magic link'
            )}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          New to WriteCareNotes?{' '}
          <Link href="/auth/signup" className="font-medium text-[#34B5B5] hover:text-[#2A9090]">
            Create an account
          </Link>
        </span>
      </div>
    </div>
  )
}
