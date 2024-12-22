'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Briefcase,
  FileVideo,
  FileCheck,
  FileQuestion,
  ClipboardCheck
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ResourceType {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  href: string;
}

const resourceTypes: ResourceType[] = [
  {
    title: 'Documentation',
    description: 'Access comprehensive documentation for care home management, including templates, forms, and best practices.',
    icon: FileText,
    features: [
      'Care plan templates',
      'Assessment forms',
      'Policy documents',
      'Procedure guides',
      'Record keeping tools',
      'Quality assurance checklists'
    ],
    href: '/resources/documentation'
  },
  {
    title: 'Training Materials',
    description: 'Professional training resources for care staff development and continuous learning.',
    icon: GraduationCap,
    features: [
      'Staff training modules',
      'Certification courses',
      'Skills assessments',
      'Learning materials',
      'Training videos',
      'Progress tracking tools'
    ],
    href: '/resources/training'
  },
  {
    title: 'Best Practices',
    description: 'Industry-leading best practices and guidelines for exceptional care delivery.',
    icon: ClipboardCheck,
    features: [
      'Care standards',
      'Safety protocols',
      'Quality benchmarks',
      'Operational guidelines',
      'Service improvement tips',
      'Risk management'
    ],
    href: '/resources/best-practices'
  },
  {
    title: 'Regulatory Guidance',
    description: 'Stay compliant with up-to-date regulatory information and compliance guides.',
    icon: FileCheck,
    features: [
      'CQC requirements',
      'Legal updates',
      'Compliance checklists',
      'Inspection preparation',
      'Policy templates',
      'Regulatory changes'
    ],
    href: '/resources/regulatory'
  },
  {
    title: 'Case Studies',
    description: 'Real-world examples and success stories from care homes using our platform.',
    icon: BookOpen,
    features: [
      'Success stories',
      'Implementation examples',
      'ROI analysis',
      'User testimonials',
      'Impact reports',
      'Best practice examples'
    ],
    href: '/resources/case-studies'
  },
  {
    title: 'Business Tools',
    description: 'Essential tools and resources for efficient care home business management.',
    icon: Briefcase,
    features: [
      'Financial planning',
      'Staff scheduling',
      'Resource management',
      'Performance metrics',
      'Budget templates',
      'Business analytics'
    ],
    href: '/resources/business-tools'
  },
  {
    title: 'Video Tutorials',
    description: 'Visual guides and tutorials for using WriteCareNotes features effectively.',
    icon: FileVideo,
    features: [
      'Platform tutorials',
      'Feature guides',
      'Best practice videos',
      'Training sessions',
      'Quick tips',
      'Implementation guides'
    ],
    href: '/resources/tutorials'
  },
  {
    title: 'FAQs',
    description: 'Comprehensive answers to common questions about care home management and our platform.',
    icon: FileQuestion,
    features: [
      'Platform usage',
      'Technical support',
      'Best practices',
      'Troubleshooting',
      'Common issues',
      'Quick solutions'
    ],
    href: '/resources/faqs'
  }
];

export default function ResourcesContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
              Professional Care Resources
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Access comprehensive resources to enhance your care home management and service delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resourceTypes.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Link key={index} href={resource.href}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold ml-3">{resource.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <ul className="space-y-2">
                      {resource.features.map((feature, featureIndex) => (
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
