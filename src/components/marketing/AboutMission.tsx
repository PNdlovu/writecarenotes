/**
 * WriteCareNotes.com
 * @fileoverview About Mission Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { Card } from '@/components/ui/card'
import { Heart, Shield, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const missions = [
  {
    icon: Heart,
    title: 'Resident-Centered Care',
    description: 'Putting residents\' needs first with personalized care plans and detailed health tracking.',
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50',
    delay: 0
  },
  {
    icon: Shield,
    title: 'Compliance & Safety',
    description: 'Ensuring care homes meet and exceed regulatory requirements across all regions.',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    delay: 0.2
  },
  {
    icon: Clock,
    title: 'Efficiency & Time-Saving',
    description: 'Streamlining administrative tasks to allow more time for direct resident care.',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    delay: 0.4
  },
  {
    icon: Users,
    title: 'Connected Communities',
    description: 'Building stronger connections between residents, families, and care staff.',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    delay: 0.6
  },
]

export function AboutMission() {
  return (
    <div className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-primary/5" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground">
              We're dedicated to improving care home operations and resident well-being through
              innovative digital solutions that put people first.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {missions.map((mission) => (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: mission.delay }}
            >
              <Card className="group relative overflow-hidden">
                <div className={`absolute inset-0 ${mission.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative p-6">
                  <div className={`inline-flex p-3 rounded-lg ${mission.iconColor} ${mission.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <mission.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 group-hover:${mission.iconColor} transition-colors`}>
                    {mission.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {mission.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}