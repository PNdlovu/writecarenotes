'use client';

import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import {
  Heart,
  Clock,
  Calendar,
  Pill,
  Users,
  Activity,
  Utensils,
  Brain
} from 'lucide-react';

const features = [
  {
    title: 'Medication Management',
    description: 'Digital medication tracking system with automated reminders and administration logs.',
    icon: Pill,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Activity Planning',
    description: 'Smart activity scheduling software with engagement tracking and outcome reporting.',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Nutrition Monitoring',
    description: 'Digital meal planning and dietary tracking system with nutritional analytics.',
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    title: 'Social Engagement',
    description: 'Community activity management platform with participation tracking and social metrics.',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Health Monitoring',
    description: 'Comprehensive health tracking system with vital signs monitoring and trend analysis.',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    title: 'Memory Support',
    description: 'Cognitive assessment tools with personalized memory exercise programs.',
    icon: Brain,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

const benefits = [
  'Automated care documentation',
  'Real-time health monitoring',
  'Digital medication tracking',
  'Staff coordination tools',
  'Analytics and reporting',
  'Compliance management'
];

export default function ElderlyCarePage() {
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
                Elderly Care Software Solutions
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Comprehensive digital platform for elderly care management, enabling efficient care delivery and improved resident outcomes.
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
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:shadow-md transition-all duration-300`}>
                      <Icon className={`h-6 w-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${feature.color} mb-2 group-hover:opacity-80 transition-opacity duration-300`}>
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
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
              className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/demo">Request Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Transform Your Elderly Care Services
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover how our elderly care software can streamline operations and enhance care quality.
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
                className="w-full sm:w-auto min-w-[200px] border-2 border-white hover:bg-white hover:text-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
