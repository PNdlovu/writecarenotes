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
    title: 'Care & Children\'s Home Management',
    description: 'Unified platform supporting both care homes and children\'s homes with specialized features for each setting.',
    icon: '🏥',
  },
  {
    title: 'Clinical & Health Management',
    description: 'Health tracking, medication management (eMAR), appointments, and specialized children\'s health monitoring.',
    icon: '💊',
  },
  {
    title: 'Staff & Safeguarding',
    description: 'Advanced staff management, DBS tracking, safeguarding procedures, and specialized children\'s home training records.',
    icon: '👥',
  },
  {
    title: 'Comprehensive Compliance',
    description: 'Built-in compliance with CQC, Ofsted, CIW, Care Inspectorate, RQIA & HIQA standards. Automated audit trails.',
    icon: '✓',
  },
  {
    title: 'Education & Development',
    description: 'Track educational progress, activities, achievements, and development goals for children\'s homes.',
    icon: '📚',
  },
  {
    title: 'Family & Social Worker Portal',
    description: 'Secure access for families, social workers, and other authorized professionals with role-based permissions.',
    icon: '👨‍👩‍👦',
  },
  {
    title: 'Enterprise Features',
    description: 'Multi-site management, custom reporting, API integration, and regional data centers across UK & Ireland.',
    icon: '🏢',
  },
  {
    title: '24/7 Expert Support',
    description: 'UK-based support team with expertise in both care home and children\'s home regulations.',
    icon: '🎓',
  }
]

export function DemoFeatures() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Enterprise-Grade Care & Children\'s Home Platform
        </h2>
        <p className="mt-4 text-base text-gray-600">
          A comprehensive solution trusted by over 500 care homes and children\'s homes across the UK and Ireland.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50">
              <span className="text-2xl" role="img" aria-label={feature.title}>
                {feature.icon}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}