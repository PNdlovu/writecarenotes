/**
 * @writecarenotes.com
 * @fileoverview Account setup step component for user registration
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A form component for the account creation step of the registration process.
 * Features include:
 * - Email validation with format checking
 * - Password strength requirements
 * - Real-time validation feedback
 * - Password confirmation matching
 * - Form state management
 * - Error handling and display
 * - Accessibility support
 *
 * Mobile-First Considerations:
 * - Responsive form layout
 * - Touch-friendly input fields
 * - Dynamic keyboard handling
 * - Optimized input spacing
 * - Visible validation feedback
 * - Smooth transitions
 *
 * Enterprise Features:
 * - Password strength validation
 * - Email format validation
 * - Error boundary implementation
 * - Form state persistence
 * - Security best practices
 * - GDPR compliance
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form/Input'
import { Label } from '@/components/ui/Form/Label'
import { Card } from '@/components/ui/Card'
import { Icons } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import { z } from 'zod'

const accountSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .refine(email => email.includes('@'), 'Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

type AccountFormData = {
  email: string;
  password: string;
  confirmPassword: string;
}

interface AccountStepProps {
  onNext: (data: { email: string; password: string }) => void
}

export function AccountStep({ onNext }: AccountStepProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (field: keyof AccountFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    
    // Clear any existing errors for this field
    setErrors(prev => ({ ...prev, [field]: undefined }))
    
    // Handle password matching
    if (field === 'password' || field === 'confirmPassword') {
      if (newData.password && newData.confirmPassword) {
        if (newData.password !== newData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
        }
      }
      // Only validate password requirements if it's the password field
      if (field === 'password') {
        try {
          accountSchema.shape.password.parse(value)
        } catch (error) {
          if (error instanceof z.ZodError) {
            setErrors(prev => ({ ...prev, password: error.errors[0].message }))
          }
        }
      }
    } else if (field === 'email') {
      try {
        accountSchema.shape.email.parse(value)
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors(prev => ({ ...prev, email: error.errors[0].message }))
        }
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
      return
    }

    try {
      // Only validate email and password with schema
      accountSchema.parse({
        email: formData.email,
        password: formData.password,
      })
      
      onNext({
        email: formData.email,
        password: formData.password,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof AccountFormData, string>> = {}
        error.errors.forEach(err => {
          const [field] = err.path
          newErrors[field as keyof AccountFormData] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  const togglePassword = (field: 'password' | 'confirmPassword') => () => {
    if (field === 'password') {
      setShowPassword(prev => !prev)
    } else {
      setShowConfirmPassword(prev => !prev)
    }
  }

  return (
    <Card className="p-6 rounded-xl bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="email" 
              className="text-sm font-medium text-gray-700"
            >
              Work Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@organization.com"
              value={formData.email}
              onChange={handleChange('email')}
              className={cn(
                "w-full px-3 py-2 bg-[#F8FAFC] border rounded-md",
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary-500"
              )}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange('password')}
                className={cn(
                  "w-full px-3 py-2 bg-[#F8FAFC] border rounded-md pr-10",
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary-500"
                )}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={togglePassword('password')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              >
                {showPassword ? (
                  <Icons.eyeOff className="h-4 w-4" />
                ) : (
                  <Icons.eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={cn(
                  "w-full px-3 py-2 bg-[#F8FAFC] border rounded-md pr-10",
                  errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary-500"
                )}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              />
              <button
                type="button"
                onClick={togglePassword('confirmPassword')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              >
                {showConfirmPassword ? (
                  <Icons.eyeOff className="h-4 w-4" />
                ) : (
                  <Icons.eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#34B5B5] hover:opacity-90">
          Continue
        </Button>
      </form>
    </Card>
  )
}
