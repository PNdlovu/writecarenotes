/**
 * WriteCareNotes.com
 * @fileoverview Support Content Component - Displays supported care types
 * @version 1.0.0
 * @created 2024-12-22
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client';

import { Card } from '@/components/ui/card/card';
import Link from 'next/link';
import {
  Heart,
  Brain,
  Baby,
  Home,
  Sparkles,
  Clock,
  Puzzle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const careTypes = [
  {
    title: 'Elderly Care',
    description: 'Comprehensive support for elderly residents including personal care, medication management, and social activities.',
    icon: Heart,
    features: [
      'Medication management',
      'Personal care assistance',
      'Social activities',
      'Mobility support',
      'Nutrition planning'
    ],
    href: '/support/elderly-care'
  },
  {
    title: 'Mental Health Care',
    description: 'Specialized care for individuals with mental health conditions, focusing on therapeutic support and wellbeing.',
    icon: Brain,
    features: [
      'Mental health assessments',
      'Therapeutic activities',
      'Medication monitoring',
      'Crisis management',
      'Recovery planning'
    ],
    href: '/support/mental-health'
  },
  {
    title: 'Learning Disabilities',
    description: 'Tailored support for individuals with learning disabilities, promoting independence and skill development.',
    icon: Sparkles,
    features: [
      'Skills development',
      'Educational support',
      'Daily living assistance',
      'Communication aids',
      'Activity planning'
    ],
    href: '/support/learning-disabilities'
  },
  {
    title: 'Physical Disabilities',
    description: 'Specialized care for individuals with physical disabilities, focusing on mobility and independence.',
    icon: User,
    features: [
      'Personal care assistance',
      'Mobility support',
      'Equipment management',
      'Therapy coordination',
      'Home adaptation advice',
      'Activity planning',
      'Transportation assistance',
      'Community access support'
    ],
    href: '/support/physical-disabilities'
  },
  {
    title: "Children's Services",
    description: "Our children's services provide comprehensive support for children with various needs, ensuring their development and wellbeing.",
    icon: Baby,
    features: [
      'Individual care planning',
      'Educational support',
      'Development monitoring',
      'Healthcare coordination',
      'Family support services',
      'Activity programs',
      'Behavioral support',
      'Social skills development'
    ],
    href: '/support/childrens-services'
  },
  {
    title: 'Autism Support',
    description: "We provide specialized support for individuals with autism, creating structured environments that promote development and independence.",
    icon: Puzzle,
    features: [
      'Sensory-friendly environments',
      'Communication support',
      'Behavioral management',
      'Life skills development',
      'Social skills training',
      'Educational support',
      'Family guidance',
      'Routine management'
    ],
    href: '/support/autism-support'
  },
  {
    title: 'Domiciliary Care',
    description: "Our domiciliary care services provide professional support in the comfort of your own home, maintaining independence and quality of life.",
    icon: Home,
    features: [
      'Personal care assistance',
      'Medication management',
      'Household support',
      'Meal preparation',
      'Shopping assistance',
      'Social companionship',
      'Health monitoring',
      'Family respite'
    ],
    href: '/support/domiciliary-care'
  },
  {
    title: 'Respite Care',
    description: "Our respite care services provide temporary relief for primary caregivers while ensuring continuity of care for individuals.",
    icon: Clock,
    features: [
      'Short-term care support',
      'Planned breaks',
      'Emergency cover',
      'Activity programs',
      'Personal care',
      'Medication management',
      'Social engagement',
      'Family support'
    ],
    href: '/support/respite-care'
  }
];

export default function SupportContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
              Supporting All Types of Care
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our platform is designed to support various care types, ensuring every resident receives the specialized care they need.
            </p>
          </div>
        </div>
      </section>

      {/* Care Types Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {careTypes.map((care, index) => {
              const Icon = care.icon;
              return (
                <Link key={index} href={care.href}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold ml-3">{care.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{care.description}</p>
                    <ul className="space-y-2">
                      {care.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
