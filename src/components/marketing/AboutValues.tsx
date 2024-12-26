/**
 * WriteCareNotes.com
 * @fileoverview About Values Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { Star, Lightbulb, Shield, Heart, Users, AccessibilityIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const values = [
  {
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from product development to customer support.',
    icon: Star,
    color: 'text-yellow-500',
    gradient: 'from-yellow-500/20 to-yellow-500/5',
    delay: 0
  },
  {
    title: 'Innovation',
    description: 'Continuously improving our platform with cutting-edge technology and user feedback.',
    icon: Lightbulb,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-blue-500/5',
    delay: 0.1
  },
  {
    title: 'Integrity',
    description: 'Operating with transparency and honesty in all our interactions.',
    icon: Shield,
    color: 'text-green-500',
    gradient: 'from-green-500/20 to-green-500/5',
    delay: 0.2
  },
  {
    title: 'Empathy',
    description: 'Understanding and responding to the unique needs of care homes and their residents.',
    icon: Heart,
    color: 'text-rose-500',
    gradient: 'from-rose-500/20 to-rose-500/5',
    delay: 0.3
  },
  {
    title: 'Collaboration',
    description: 'Working closely with care providers to develop solutions that truly make a difference.',
    icon: Users,
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-purple-500/5',
    delay: 0.4
  },
  {
    title: 'Accessibility',
    description: 'Making our platform accessible and inclusive for all users.',
    icon: AccessibilityIcon,
    color: 'text-indigo-500',
    gradient: 'from-indigo-500/20 to-indigo-500/5',
    delay: 0.5
  }
]

export function AboutValues() {
  return (
    <div className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Our Core Values
          </h2>
          <p className="text-lg text-muted-foreground">
            The principles that guide us in our mission to transform care home management.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: value.delay }}
            >
              <div className="relative group h-full">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative h-full p-6 bg-card rounded-2xl border shadow-sm">
                  <div className={`inline-flex p-3 rounded-lg ${value.color} bg-white/10 mb-4`}>
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${value.color}`}>{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}