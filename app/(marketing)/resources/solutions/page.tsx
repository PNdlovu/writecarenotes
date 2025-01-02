import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { ChevronRight, Heart, ClipboardList, Users, Brain, Clock, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Care Documentation Solutions | Write Care Notes',
  description: 'User-friendly documentation solutions for all care providers, focusing on accessibility and ease of use',
};

const solutions = [
  {
    title: 'Daily Care Recording',
    description: 'Quick and easy daily notes, perfect for busy caregivers. Voice-to-text support and mobile-friendly interface.',
    href: '/resources/solutions/daily-recording',
    icon: ClipboardList,
    features: ['Voice input support', 'Quick templates', 'Mobile-friendly', 'Offline access']
  },
  {
    title: 'Care Planning Made Simple',
    description: 'Intuitive care plan creation with smart templates and visual aids. Supports all types of care needs.',
    href: '/resources/solutions/care-planning',
    icon: Brain,
    features: ['Visual care maps', 'Smart suggestions', 'Easy updates', 'Person-centered']
  },
  {
    title: 'Team Collaboration',
    description: 'Keep your entire care team connected and informed. Real-time updates and seamless handovers.',
    href: '/resources/solutions/team-collaboration',
    icon: Users,
    features: ['Real-time updates', 'Handover tools', 'Team messaging', 'Task management']
  },
  {
    title: 'Time-Saving Tools',
    description: 'Spend less time on paperwork and more time with those you care for. Automated workflows and smart features.',
    href: '/resources/solutions/time-saving',
    icon: Clock,
    features: ['Auto-complete', 'Bulk updates', 'Smart forms', 'Quick actions']
  },
  {
    title: 'Quality & Compliance',
    description: 'Stay compliant with ease. Built-in checks and regulatory updates for peace of mind.',
    href: '/resources/solutions/compliance',
    icon: Shield,
    features: ['Compliance checks', 'Audit tools', 'Policy updates', 'Evidence tracking']
  },
  {
    title: 'Learning & Support',
    description: 'Comprehensive training and support resources. Available 24/7 with accessibility features.',
    href: '/resources/solutions/learning',
    icon: Star,
    features: ['Video tutorials', '24/7 support', 'Practice mode', 'Guided tours']
  },
];

export default function SolutionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">Care Documentation Solutions</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Supporting caregivers of all ages with intuitive, accessible tools that make documentation simple and efficient.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/demo">Try It Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/resources/documentation">View Templates</Link>
            </Button>
          </div>
        </div>

        {/* Accessibility Features Banner */}
        <div className="bg-blue-50 rounded-lg p-6 mb-12">
          <h2 className="text-lg font-semibold mb-3">Accessibility First</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-500" />
              <span>Voice input support</span>
            </li>
            <li className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-500" />
              <span>High contrast mode</span>
            </li>
            <li className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-500" />
              <span>Screen reader optimized</span>
            </li>
            <li className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-500" />
              <span>Adjustable text size</span>
            </li>
          </ul>
        </div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <Link key={solution.title} href={solution.href}>
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <Icon className="h-8 w-8 text-blue-500" />
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{solution.title}</h2>
                        <p className="text-gray-600 mb-4">{solution.description}</p>
                      </div>
                    </div>
                    <ul className="grid grid-cols-2 gap-2 mt-auto">
                      {solution.features.map((feature) => (
                        <li key={feature} className="text-sm text-gray-500 flex items-center gap-1">
                          <ChevronRight className="h-4 w-4" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Need help choosing the right solution? Our team is here 24/7.
          </p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
