/**
 * WriteCareNotes.com
 * @fileoverview Demo Request Form Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

export function DemoRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // TODO: Implement form submission
    setIsSubmitting(false)
  }

  return (
    <Card className="p-8 shadow-xl bg-white border-2 border-blue-100 rounded-xl">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">Request Your Free Demo</h3>
        <p className="text-muted-foreground text-lg">See how Write Care Notes can transform your care home operations</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name</Label>
              <Input 
                id="firstName" 
                required 
                className="h-12 border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md rounded-lg"
                placeholder="John"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name</Label>
              <Input 
                id="lastName" 
                required 
                className="h-12 border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md rounded-lg"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Work Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              className="h-12 border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md rounded-lg"
              placeholder="john.doe@carehome.com"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="organization" className="text-sm font-semibold text-gray-700">Organization Name</Label>
            <Input 
              id="organization" 
              required 
              className="h-12 border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md rounded-lg"
              placeholder="Your Care Home Name"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="region" className="text-sm font-semibold text-gray-700">Region</Label>
            <Select required>
              <SelectTrigger className="h-12 border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md rounded-lg bg-white">
                <SelectValue placeholder="Select your region" className="text-muted-foreground" />
              </SelectTrigger>
              <SelectContent className="border-2 border-blue-100 shadow-lg rounded-lg">
                <SelectItem value="england" className="hover:bg-blue-50">England</SelectItem>
                <SelectItem value="wales" className="hover:bg-blue-50">Wales</SelectItem>
                <SelectItem value="scotland" className="hover:bg-blue-50">Scotland</SelectItem>
                <SelectItem value="northern-ireland" className="hover:bg-blue-50">Northern Ireland</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Additional Information</Label>
            <Textarea 
              id="message" 
              className="min-h-[120px] border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md rounded-lg resize-none"
              placeholder="Tell us about your care home and what you're looking for..."
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-200 text-lg font-semibold text-white shadow-md hover:shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Request Your Free Demo'
          )}
        </Button>
      </form>
    </Card>
  )
} 