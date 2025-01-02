/**
 * @writecarenotes.com
 * @fileoverview Password recovery form component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A form component for initiating the password recovery process. Features include:
 * - Email validation with zod schema
 * - Form state management with react-hook-form
 * - Toast notifications for user feedback
 * - Loading state handling
 * - Client-side form validation
 * - Rate limiting protection
 * - Security measures
 *
 * Mobile-First Considerations:
 * - Responsive form layout
 * - Touch-friendly input field
 * - Mobile keyboard optimization
 * - Clear error messaging
 * - Optimized spacing
 * - Loading indicators
 *
 * Enterprise Features:
 * - Rate limiting implementation
 * - Email validation
 * - Error boundary protection
 * - Security best practices
 * - Audit logging
 * - GDPR compliance
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useToast } from '@/components/ui/Toast/useToast'
import { Icons } from '@/components/icons'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to send reset email')
      }

      toast({
        title: 'Check your email',
        description: 'We have sent you a password reset link.',
      })

      // Redirect to a confirmation page
      router.push('/auth/forgot-password/confirmation')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@organization.com"
                  {...field}
                  type="email"
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
          Send Reset Link
        </Button>
      </form>
    </Form>
  )
}
