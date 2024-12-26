import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Elderly Care Documentation | Write Care Notes',
  description: 'Comprehensive care documentation solutions for elderly care services',
};

const features = [
  {
    title: 'Person-Centered Care Plans',
    description: 'Create detailed care plans that focus on individual needs, preferences, and goals.',
  },
  {
    title: 'Daily Notes & Observations',
    description: 'Record daily activities, health observations, and care interactions efficiently.',
  },
  {
    title: 'Risk Assessments',
    description: 'Comprehensive risk assessment tools specific to elderly care needs.',
  },
  {
    title: 'Medication Management',
    description: 'Detailed medication administration records and monitoring tools.',
  },
  {
    title: 'Health Monitoring',
    description: 'Track vital signs, weight, nutrition, and other health indicators.',
  },
  {
    title: 'CQC Compliance',
    description: 'Documentation aligned with CQC requirements and best practices.',
  },
];

const resources = [
  {
    title: 'Care Plan Templates',
    description: 'Specialized templates for elderly care documentation',
    href: '/resources/documentation/care-planning/elderly-care',
  },
  {
    title: 'Best Practices Guide',
    description: 'Documentation guidelines for elderly care services',
    href: '/resources/best-practices/elderly-care',
  },
  {
    title: 'Training Resources',
    description: 'Staff training materials for elderly care documentation',
    href: '/resources/training/elderly-care',
  },
];

export default function ElderlyCare() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Elderly Care Documentation</h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive documentation solutions designed specifically for elderly care services,
            ensuring quality care delivery and regulatory compliance.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/demo">Request Demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/resources/documentation/care-planning/elderly-care">View Templates</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Resources Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
          <div className="grid gap-4">
            {resources.map((resource) => (
              <Link key={resource.title} href={resource.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold mb-2">{resource.title}</h3>
                  <p className="text-gray-600">{resource.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
