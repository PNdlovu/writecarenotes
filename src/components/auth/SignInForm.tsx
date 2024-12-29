/**
 * WriteCareNotes.com
 * @fileoverview Sign In Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

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

      // Successful login
      toast({
        title: "Success",
        description: "You have been signed in",
      })

      // Redirect to dashboard
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@organization.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={isLoading}
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

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:text-primary-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary-600 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-primary hover:text-primary-600 hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}
