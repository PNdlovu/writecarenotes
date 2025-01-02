'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import { Command } from '@/components/ui/command';
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

const careTypeDetails = {
  'elderly-care': {
    title: 'Elderly Care',
    icon: Heart,
    description: "Our comprehensive elderly care services are designed to provide dignified, personalized support that enhances quality of life while maintaining independence.",
    features: [
      'Personalized care plans tailored to individual needs',
      'Medication management and health monitoring',
      'Assistance with daily activities and personal care',
      'Social engagement and recreational activities',
      'Nutritional planning and meal assistance',
      'Mobility support and fall prevention',
      'Regular health assessments',
      'Family communication and updates'
    ],
    benefits: [
      'Maintain dignity and independence',
      'Improve quality of life',
      'Reduce hospital admissions',
      'Better medication compliance',
      'Enhanced social interaction'
    ]
  },
  'mental-health': {
    title: 'Mental Health Care',
    icon: Brain,
    description: "Our mental health care services provide comprehensive support for individuals dealing with mental health conditions, focusing on recovery and wellbeing.",
    features: [
      'Professional mental health assessments',
      'Individual and group therapy sessions',
      'Medication management and monitoring',
      'Crisis intervention and support',
      'Life skills development',
      'Structured daily activities',
      'Family support and education',
      'Recovery-focused care planning'
    ],
    benefits: [
      'Improved mental wellbeing',
      'Better coping strategies',
      'Enhanced quality of life',
      'Reduced crisis incidents',
      'Greater independence'
    ]
  },
  'learning-disabilities': {
    title: 'Learning Disabilities',
    icon: Sparkles,
    description: "We provide specialized support for individuals with learning disabilities, focusing on developing skills and promoting independence.",
    features: [
      'Personalized learning programs',
      'Life skills development',
      'Communication support',
      'Social skills training',
      'Educational assistance',
      'Vocational training',
      'Community integration',
      'Family support services'
    ],
    benefits: [
      'Increased independence',
      'Improved communication skills',
      'Better social integration',
      'Enhanced learning outcomes',
      'Greater self-confidence'
    ]
  },
  'physical-disabilities': {
    title: 'Physical Disabilities',
    icon: User,
    description: "Our physical disability support services are designed to maximize independence and quality of life through specialized care and assistance.",
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
    benefits: [
      'Enhanced mobility',
      'Greater independence',
      'Improved quality of life',
      'Better community access',
      'Increased confidence'
    ]
  },
  'childrens-services': {
    title: "Children's Services",
    icon: Baby,
    description: "Our children's services provide comprehensive support for children with various needs, ensuring their development and wellbeing.",
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
    benefits: [
      'Enhanced development',
      'Better educational outcomes',
      'Improved social skills',
      'Strong family support',
      'Positive behavioral changes'
    ]
  },
  'autism-support': {
    title: 'Autism Support',
    icon: Puzzle,
    description: "We provide specialized support for individuals with autism, creating structured environments that promote development and independence.",
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
    benefits: [
      'Better communication',
      'Reduced anxiety',
      'Improved social interaction',
      'Enhanced independence',
      'Structured routines'
    ]
  },
  'domiciliary-care': {
    title: 'Domiciliary Care',
    icon: Home,
    description: "Our domiciliary care services provide professional support in the comfort of your own home, maintaining independence and quality of life.",
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
    benefits: [
      'Maintain independence',
      'Stay in familiar environment',
      'Personalized care',
      'Flexible support',
      'Peace of mind'
    ]
  }
};

export default function CareTypePage() {
  const params = useParams();
  const careType = params.type as string;
  const details = careTypeDetails[careType as keyof typeof careTypeDetails];

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Care Type Not Found</h1>
          <p className="text-gray-600 mb-8">The care type you're looking for doesn't exist.</p>
          <Link href="/support">
            <Button>Return to Support</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = details.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Command
        hotkeys={[
          {
            id: 'help',
            title: 'Help',
            hotkey: '?',
            handler: () => {
              // Show help
            }
          },
          {
            id: 'theme',
            title: 'Change Theme',
            hotkey: 'cmd+t',
            handler: () => {
              // Toggle theme
            }
          }
        ]}
      />
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block p-3 rounded-full bg-blue-100 mb-6">
            <Icon className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            {details.title}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {details.description}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Features */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3" />
                  <p className="text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/demo">
              <Button size="lg" className="mr-4">
                Request Demo
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" size="lg">
                View All Care Types
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
