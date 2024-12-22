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
  ClipboardCheck,
  Video,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ResourceType {
  title: string;
  description: string;
  icon: JSX.Element;
  href: string;
}

const resourceCards: ResourceType[] = [
  {
    title: 'Documentation',
    description: 'Learn how to use Write Care Notes effectively with our comprehensive guides.',
    icon: <BookOpen className="h-8 w-8 text-brand-teal" />,
    href: '/resources/documentation',
  },
  {
    title: 'Training Videos',
    description: 'Watch step-by-step tutorials on how to use various features.',
    icon: <Video className="h-8 w-8 text-brand-green" />,
    href: '/resources/videos',
  },
  {
    title: 'Best Practices',
    description: 'Discover recommended workflows and care documentation standards.',
    icon: <CheckCircle className="h-8 w-8 text-brand-blue" />,
    href: '/resources/best-practices',
  },
  {
    title: 'Training Materials',
    description: 'Professional training resources for care staff development and continuous learning.',
    icon: <GraduationCap className="h-8 w-8 text-brand-blue" />,
    href: '/resources/training',
  },
  {
    title: 'Regulatory Guidance',
    description: 'Stay compliant with up-to-date regulatory information and compliance guides.',
    icon: <FileCheck className="h-8 w-8 text-brand-teal" />,
    href: '/resources/regulatory',
  },
  {
    title: 'Case Studies',
    description: 'Real-world examples and success stories from care homes using our platform.',
    icon: <BookOpen className="h-8 w-8 text-brand-green" />,
    href: '/resources/case-studies',
  },
  {
    title: 'Business Tools',
    description: 'Essential tools and resources for efficient care home business management.',
    icon: <Briefcase className="h-8 w-8 text-brand-blue" />,
    href: '/resources/business-tools',
  },
  {
    title: 'Video Tutorials',
    description: 'Visual guides and tutorials for using WriteCareNotes features effectively.',
    icon: <FileVideo className="h-8 w-8 text-brand-teal" />,
    href: '/resources/tutorials',
  },
  {
    title: 'FAQs',
    description: 'Comprehensive answers to common questions about care home management and our platform.',
    icon: <FileQuestion className="h-8 w-8 text-brand-green" />,
    href: '/resources/faqs',
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resourceCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative rounded-lg border border-form-border p-6 hover:border-brand-teal transition-colors"
              >
                <div className="flex items-center gap-4">
                  {card.icon}
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <p className="mt-2 text-muted-foreground">{card.description}</p>
                <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-brand-teal opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
