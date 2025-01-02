'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/Button/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/Input/Input'
import { useToast } from '@/components/ui/Toast/use-toast'
import { Icons } from '@/components/icons'
import { MarketingNavbar } from '@/components/marketing/Navbar'
import { MarketingFooter } from '@/components/marketing/Footer'

const formSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof formSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      toast({
        title: 'Invalid reset link',
        description: 'Please request a new password reset link.',
        variant: 'destructive',
      })
      router.push('/auth/forgot-password')
      return
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          throw new Error('Invalid or expired token')
        }

        setIsTokenValid(true)
      } catch (error) {
        toast({
          title: 'Invalid reset link',
          description: 'This reset link has expired. Please request a new one.',
          variant: 'destructive',
        })
        router.push('/auth/forgot-password')
      }
    }

    verifyToken()
  }, [searchParams, router, toast])

  async function onSubmit(data: FormData) {
    const token = searchParams.get('token')
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset password')
      }

      toast({
        title: 'Password reset successful',
        description: 'You can now sign in with your new password.',
      })

      router.push('/auth/signin')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isTokenValid) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <MarketingNavbar />
      
      <main className="flex-1">
        <div className="container relative min-h-[calc(100vh-14rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
          <div className="mx-auto w-full sm:w-[450px]">
            <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100">
              <div className="flex flex-col space-y-2 text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Reset your password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your new password below.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-[#34B5B5] hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Reset Password
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
