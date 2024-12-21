'use client'

import React from 'react'
import * as LucideIcons from 'lucide-react'

type Feature = {
  name: string
  description: string
  iconName: keyof typeof LucideIcons
  color: string
  gradient: string
}

type FeaturesProps = {
  features: Feature[]
}

const features: Feature[] = [
  {
    name: 'Care Planning',
    description: "Comprehensive digital care plans that adapt to each resident's unique needs. Real-time updates and easy access for care staff.",
    iconName: 'ClipboardList',
    color: 'bg-blue-500',
    gradient: 'ring-blue-500'
  },
  {
    name: 'Medication Management',
    description: "Secure medication tracking with MAR charts, automated alerts, and comprehensive audit trails.",
    iconName: 'Pills',
    color: 'bg-green-500',
    gradient: 'ring-green-500'
  },
  {
    name: 'Staff Management',
    description: "Efficient rota planning, skill matching, and staff allocation. Track training and certifications.",
    iconName: 'Users',
    color: 'bg-purple-500',
    gradient: 'ring-purple-500'
  },
  {
    name: 'Incident Reporting',
    description: "Quick and detailed incident reporting with automatic notifications and follow-up tracking.",
    iconName: 'Bell',
    color: 'bg-red-500',
    gradient: 'ring-red-500'
  },
  {
    name: 'Family Portal',
    description: "Keep families connected with secure access to updates, photos, and communications about their loved ones.",
    iconName: 'UserCircle',
    color: 'bg-yellow-500',
    gradient: 'ring-yellow-500'
  },
  {
    name: 'Compliance & Reporting',
    description: "Built-in compliance checks and automated reporting for CQC, CIW, and other regulatory bodies.",
    iconName: 'FileCheck',
    color: 'bg-indigo-500',
    gradient: 'ring-indigo-500'
  },
  {
    name: 'Offline Support',
    description: "Continue working even without internet connection. Automatic sync when connection is restored.",
    iconName: 'Wifi',
    color: 'bg-cyan-500',
    gradient: 'ring-cyan-500'
  },
  {
    name: 'Data Security',
    description: "Enterprise-grade security with encryption, role-based access control, and regular backups.",
    iconName: 'Lock',
    color: 'bg-slate-500',
    gradient: 'ring-slate-500'
  },
  {
    name: 'Health Monitoring',
    description: "Track vital signs, health metrics, and wellness indicators. Early warning system for health changes.",
    iconName: 'HeartPulse',
    color: 'bg-rose-500',
    gradient: 'ring-rose-500'
  }
]

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Comprehensive Care Management
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage your care home
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform provides all the tools you need to deliver outstanding care, manage your team efficiently, and stay compliant with regulations.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = LucideIcons[feature.iconName]
              return (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className={`rounded-lg p-2 ring-1 ring-inset ring-gray-200 ${feature.color} ${feature.gradient}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      </div>
    </div>
  )
}
