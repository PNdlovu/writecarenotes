/**
 * WriteCareNotes.com
 * @fileoverview Demo Request Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { DemoRequestForm } from '@/components/marketing/DemoRequestForm'
import { DemoFeatures } from '@/components/marketing/DemoFeatures'

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
          Experience Write Care Notes in Action
        </h1>
        <p className="text-xl text-muted-foreground">
          See how our platform can transform your care home management with a personalized demo
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <DemoFeatures />
        <DemoRequestForm />
      </div>
    </div>
  )
} 