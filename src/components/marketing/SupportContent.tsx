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
  User,
  Flower2,
  Pill,
  Bed,
  Stethoscope,
  HeartPulse,
  Glasses
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const careTypes = [
  {
    title: 'Elderly Care',
    description: 'Comprehensive support for elderly residents including personal care, medication management, and social activities.',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    features: [
      'Medication management',
      'Personal care assistance',
      'Social activities',
      'Mobility support',
      'Nutrition planning',
      'Dementia support',
      'End of life care',
      'Falls prevention'
    ],
    href: '/support/elderly-care'
  },
  {
    title: 'Mental Health Care',
    description: 'Specialized care for individuals with mental health conditions, focusing on therapeutic support and wellbeing.',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: [
      'Mental health assessments',
      'Therapeutic activities',
      'Medication monitoring',
      'Crisis management',
      'Recovery planning',
      'Dual diagnosis support',
      'Community integration',
      'Family support'
    ],
    href: '/support/mental-health'
  },
  {
    title: 'Learning Disabilities',
    description: 'Tailored support for individuals with learning disabilities, promoting independence and skill development.',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: [
      'Skills development',
      'Educational support',
      'Daily living assistance',
      'Communication aids',
      'Activity planning',
      'Behavioral support',
      'Social inclusion',
      'Employment support'
    ],
    href: '/support/learning-disabilities'
  },
  {
    title: 'Physical Disabilities',
    description: 'Specialized care for individuals with physical disabilities, focusing on mobility and independence.',
    icon: User,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
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
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
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
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
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
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
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
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
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
  },
  {
    title: 'Palliative Care',
    description: "Specialized end-of-life care focusing on comfort, dignity, and quality of life for residents and support for their families.",
    icon: Flower2,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    features: [
      'Pain management',
      'Symptom control',
      'Emotional support',
      'Family counseling',
      'Spiritual care',
      'Comfort care',
      'Bereavement support',
      'Advanced care planning'
    ],
    href: '/support/palliative-care'
  },
  {
    title: 'Substance Misuse',
    description: "Comprehensive support for individuals recovering from substance misuse, focusing on recovery and rehabilitation.",
    icon: Pill,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    features: [
      'Detoxification support',
      'Recovery planning',
      'Counseling services',
      'Relapse prevention',
      'Health monitoring',
      'Life skills training',
      'Family support',
      'Community reintegration'
    ],
    href: '/support/substance-misuse'
  },
  {
    title: 'Nursing Care',
    description: "24-hour nursing care for individuals with complex medical needs, provided by qualified nursing staff.",
    icon: Stethoscope,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    features: [
      'Complex medical care',
      'Wound management',
      'Clinical assessments',
      'Medication administration',
      'Health monitoring',
      'Specialist equipment',
      'Rehabilitation support',
      'End of life care'
    ],
    href: '/support/nursing-care'
  },
  {
    title: 'Residential Care',
    description: "Long-term accommodation and personal care in a supportive environment for those who can no longer live independently.",
    icon: Bed,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    features: [
      'Personal care',
      'Accommodation',
      'Meals and nutrition',
      'Social activities',
      'Housekeeping',
      'Security and safety',
      'Healthcare coordination',
      'Community living'
    ],
    href: '/support/residential-care'
  },
  {
    title: 'Acquired Brain Injury',
    description: "Specialized support for individuals with acquired brain injuries, focusing on rehabilitation and quality of life.",
    icon: HeartPulse,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    features: [
      'Rehabilitation therapy',
      'Cognitive support',
      'Physical therapy',
      'Speech therapy',
      'Daily living skills',
      'Family support',
      'Social reintegration',
      'Long-term planning'
    ],
    href: '/support/acquired-brain-injury'
  },
  {
    title: 'Visual Impairment',
    description: "Specialized support for individuals with visual impairments, promoting independence and quality of life.",
    icon: Glasses,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    features: [
      'Mobility training',
      'Assistive technology',
      'Daily living skills',
      'Environmental adaptation',
      'Communication support',
      'Social activities',
      'Community access',
      'Independence training'
    ],
    href: '/support/visual-impairment'
  }
];

export default function SupportContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Supporting All Types of Care
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Our comprehensive platform is designed to support various care types, ensuring every resident receives the specialized care they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Care Types Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {careTypes.map((care, index) => {
              const Icon = care.icon;
              return (
                <Link 
                  key={index} 
                  href={care.href}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
                  <Card className="relative p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white/80 backdrop-blur-sm border-0">
                    <div className="flex items-center mb-6">
                      <div className={`p-3 rounded-xl ${care.bgColor} shadow-sm group-hover:shadow-md transition-all duration-300`}>
                        <Icon className={`h-6 w-6 ${care.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <h3 className={`text-xl font-semibold ml-4 ${care.color} group-hover:opacity-80 transition-colors duration-300`}>
                        {care.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6 line-clamp-2">{care.description}</p>
                    <div className="space-y-3">
                      {care.features.slice(0, 4).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <span className={`flex-shrink-0 h-5 w-5 ${care.color} mr-2`}>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="group-hover:text-gray-900 transition-colors duration-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-6 flex items-center ${care.color} font-medium text-sm group-hover:opacity-80 transition-colors duration-300`}>
                      Learn more
                      <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Action Buttons */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild
              size="lg"
              className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/support">View All Care Types</Link>
            </Button>
            <Button 
              asChild
              size="lg"
              className="w-full sm:w-auto min-w-[200px] bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/demo">Request Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need More Information?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Our team is here to help you understand how our platform can support your specific care requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="w-full sm:w-auto min-w-[200px] bg-white hover:bg-gray-50 text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/contact">Contact Our Team</Link>
              </Button>
              <Button 
                asChild
                size="lg"
                className="w-full sm:w-auto min-w-[200px] bg-transparent hover:bg-blue-500 text-white border-2 border-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/demo">Book a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
