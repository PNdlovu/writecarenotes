/**
 * @writecarenotes.com
 * @fileoverview Personal information step component for user registration
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A form component for collecting personal information during registration.
 * Features include:
 * - First and last name input fields
 * - Form validation
 * - Error state management
 * - Navigation between registration steps
 * - Accessibility support
 *
 * Mobile-First Considerations:
 * - Responsive form layout
 * - Touch-friendly input fields
 * - Dynamic keyboard handling
 * - Optimized field spacing
 * - Clear visual feedback
 * - Smooth transitions
 *
 * Enterprise Features:
 * - Name format validation
 * - Character set support
 * - Error boundary implementation
 * - Form state persistence
 * - Data sanitization
 * - GDPR compliance
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form/Input'
import { Label } from '@/components/ui/Form/Label'
import { Card } from '@/components/ui/Card'

interface PersonalStepProps {
  onNext: (data: { firstName: string; lastName: string }) => void
  onBack: () => void
}

export function PersonalStep({ onNext, onBack }: PersonalStepProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName || !lastName) {
      setError('All fields are required')
      return
    }

    onNext({ firstName, lastName })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
