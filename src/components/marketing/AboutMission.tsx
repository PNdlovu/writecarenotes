/**
 * WriteCareNotes.com
 * @fileoverview About Mission Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Card } from '@/components/ui/card'
import { Heart, Shield, Clock, Users } from 'lucide-react'

const missions = [
  {
    icon: Heart,
    title: 'Resident-Centered Care',
    description: 'Putting residents\' needs first with personalized care plans and detailed health tracking.',
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
  {
    icon: Shield,
    title: 'Compliance & Safety',
    description: 'Ensuring care homes meet and exceed regulatory requirements across all regions.',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Clock,
    title: 'Efficiency & Time-Saving',
    description: 'Streamlining administrative tasks to allow more time for direct resident care.',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Users,
    title: 'Connected Communities',
    description: 'Building stronger connections between residents, families, and care staff.',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
]

export function AboutMission() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
        <p className="text-lg text-muted-foreground">
          We're dedicated to improving care home operations and resident well-being through
          innovative digital solutions that put people first.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {missions.map((mission, index) => {
          const Icon = mission.icon
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 rounded-lg ${mission.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${mission.iconColor}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{mission.title}</h3>
                  <p className="text-muted-foreground">{mission.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}