/**
 * WriteCareNotes.com
 * @fileoverview Demo Features Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { Check } from 'lucide-react'

const features = [
  {
    title: 'Comprehensive Care Planning',
    description: "Digital care plans that adapt to each resident's needs with real-time updates.",
    icon: '📋',
  },
  {
    title: 'Medication Management',
    description: 'Secure medication tracking with MAR charts and automated alerts.',
    icon: '💊',
  },
  {
    title: 'Staff Management',
    description: 'Efficient rota planning and staff allocation with skill matching.',
    icon: '👥',
  },
  {
    title: 'Compliance & Reporting',
    description: 'Built-in compliance checks and automated reporting for CQC, CIW, and more.',
    icon: '✅',
  },
  {
    title: 'Family Portal',
    description: 'Keep families connected with secure access to updates and communications.',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    title: 'Offline Support',
    description: 'Continue working even without internet connection.',
    icon: '🔄',
  },
]

export function DemoFeatures() {
  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-lg">
      <div>
        <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
          Why Choose Write Care Notes?
        </h2>
        <p className="text-muted-foreground text-lg">
          Experience how our platform streamlines care home management while improving resident care quality.
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="text-2xl">{feature.icon}</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm">
          "Write Care Notes has transformed how we manage our care home. The system is intuitive and has significantly reduced our administrative workload."
        </p>
        <div className="mt-2 text-sm font-medium">
          - Sarah Johnson, Care Home Manager
        </div>
      </div>
    </div>
  )
}