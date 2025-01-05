/**
 * WriteCareNotes.com
 * @fileoverview Demo Request Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Form/Input"
import { Label } from "@/components/ui/Form/Label"
import { Textarea } from "@/components/ui/Form/Textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Form/Select"
import { ArrowRight } from "lucide-react"

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string
  role: string
  facilityType: string
  message: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  role: '',
  facilityType: '',
  message: ''
}

export function DemoRequestForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Implement actual form submission
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      setSubmitStatus('success')
      setFormData(initialFormData)
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              id="firstName"
              name="firstName"
              placeholder="First Name"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              required
              className="w-full"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Work Email"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone Number"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="organization"
            name="organization"
            placeholder="Care Home Name"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="jobTitle"
            name="jobTitle"
            placeholder="Job Title"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us about your care home and what you're looking for..."
            className="min-h-[100px]"
          />
        </div>
      </div>
      <Button 
        type="submit" 
        size="lg"
        className="w-full py-6 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        Book Your Demo
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
      </Button>
    </form>
  )
} 