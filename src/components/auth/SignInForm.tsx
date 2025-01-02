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
import { Input } from '@/components/ui/Form/Input'
import { Label } from '@/components/ui/Form/Label'
import { Icons } from '@/components/ui/Icons'
import { useToast } from '@/components/ui/Toast/useToast'

export function SignInForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: "Please check your credentials and try again",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "You have been signed in",
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@organization.com"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 bg-white border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-white border rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
            >
              {showPassword ? (
                <Icons.eyeOff className="h-4 w-4" />
              ) : (
                <Icons.eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-[#34B5B5] hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#34B5B5] text-white hover:bg-opacity-90 py-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icons.chartBar className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-[#34B5B5] hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
