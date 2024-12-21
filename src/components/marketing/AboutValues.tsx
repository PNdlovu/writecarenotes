/**
 * WriteCareNotes.com
 * @fileoverview About Values Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Star, Lightbulb, Shield, Heart, Users, AccessibilityIcon } from 'lucide-react'

const values = [
  {
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from product development to customer support.',
    icon: Star,
    color: 'text-yellow-500',
    gradient: 'from-yellow-500/10 to-yellow-500/5'
  },
  {
    title: 'Innovation',
    description: 'Continuously improving our platform with cutting-edge technology and user feedback.',
    icon: Lightbulb,
    color: 'text-blue-500',
    gradient: 'from-blue-500/10 to-blue-500/5'
  },
  {
    title: 'Integrity',
    description: 'Operating with transparency and honesty in all our interactions.',
    icon: Shield,
    color: 'text-green-500',
    gradient: 'from-green-500/10 to-green-500/5'
  },
  {
    title: 'Empathy',
    description: 'Understanding and responding to the unique needs of care homes and their residents.',
    icon: Heart,
    color: 'text-rose-500',
    gradient: 'from-rose-500/10 to-rose-500/5'
  },
  {
    title: 'Collaboration',
    description: 'Working closely with care providers to develop solutions that truly make a difference.',
    icon: Users,
    color: 'text-purple-500',
    gradient: 'from-purple-500/10 to-purple-500/5'
  },
  {
    title: 'Accessibility',
    description: 'Making our platform accessible and inclusive for all users.',
    icon: AccessibilityIcon,
    color: 'text-indigo-500',
    gradient: 'from-indigo-500/10 to-indigo-500/5'
  }
]

export function AboutValues() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            Our Values
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            The principles that guide us in building technology that transforms care home management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 group"
              >
                <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${value.gradient}`}>
                  <Icon className={`w-7 h-7 ${value.color}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 group-hover:${value.color} transition-colors`}>
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}