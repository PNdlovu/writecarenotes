/**
 * WriteCareNotes.com
 * @fileoverview About Hero Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { Building2, Users2, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function AboutHero() {
  return (
    <div className="relative py-24 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="absolute inset-0 bg-grid-white/10" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-6 ring-1 ring-border/50">
            🌟 Trusted by 500+ Care Homes Across the UK
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Transforming Care Home Management
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            We're on a mission to revolutionize care home operations through innovative digital solutions,
            empowering care providers to deliver exceptional resident care.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <StatCard
              icon={Building2}
              number="500+"
              label="Care Homes"
              description="Trusted partners across the UK"
            />
            <StatCard
              icon={Users2}
              number="50,000+"
              label="Residents Supported"
              description="Lives improved daily"
            />
            <StatCard
              icon={Star}
              number="98%"
              label="Satisfaction Rate"
              description="From our care partners"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, number, label, description }: {
  icon: any
  number: string
  label: string
  description: string
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-px bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200" />
      <div className="relative bg-card p-6 rounded-lg border shadow-sm">
        <Icon className="w-8 h-8 text-primary mb-4" />
        <div className="text-3xl font-bold text-primary mb-1">{number}</div>
        <div className="font-medium mb-1">{label}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}