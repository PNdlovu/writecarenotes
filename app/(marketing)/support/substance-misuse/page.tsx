'use client';

import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import {
  Pill,
  Activity,
  Brain,
  Heart,
  Users,
  Calendar,
  FileText
} from 'lucide-react';

const features = [
  {
    title: 'Recovery Tracking',
    description: 'Comprehensive recovery progress monitoring and milestone tracking system.',
    icon: Activity,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    title: 'Treatment Planning',
    description: 'Personalized treatment planning tools with progress monitoring.',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Health Monitoring',
    description: 'Real-time health tracking system with vital signs monitoring and alerts.',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    title: 'Group Management',
    description: 'Support group coordination and attendance tracking system.',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Medication Management',
    description: 'Digital medication tracking with automated alerts and documentation.',
    icon: Pill,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    title: 'Behavioral Support',
    description: 'Behavioral monitoring and intervention tracking tools.',
    icon: Brain,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

const benefits = [
  'Comprehensive recovery tracking',
  'Medication compliance monitoring',
  'Group therapy management',
  'Progress documentation',
  'Risk assessment tools',
  'Outcome reporting'
];

export default function SubstanceMisusePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800">
                Substance Misuse Recovery Support
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Comprehensive digital solutions for substance misuse recovery management, supporting individuals through their recovery journey.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor}`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${feature.color}`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Benefits</h2>
            <p className="text-gray-600">
              Our substance misuse recovery software provides comprehensive tools for managing recovery programs effectively.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-5 w-5 text-amber-600">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Enhance Your Recovery Support Services?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join recovery centers across the UK and Ireland in providing exceptional support with our digital solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                <Link href="/book-demo">Book a Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
