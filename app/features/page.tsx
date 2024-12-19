import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  ClipboardList,
  Users,
  Bell,
  Shield,
  BarChart,
  Pill,
  MessageSquare,
  FileText,
  Clock,
  Smartphone,
  Cloud
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Care Planning & Documentation',
    description: 'Create detailed care plans, track daily activities, and maintain comprehensive resident records.',
    icon: ClipboardList,
    details: [
      'Personalized care plan creation',
      'Daily activity tracking',
      'Progress notes and observations',
      'Care review scheduling',
      'Risk assessments'
    ]
  },
  {
    title: 'Medication Management',
    description: 'Comprehensive electronic medication administration record (eMAR) system.',
    icon: Pill,
    details: [
      'Electronic MAR charts',
      'Medication scheduling',
      'Stock management',
      'PRN medication tracking',
      'Medication alerts and reminders'
    ]
  },
  {
    title: 'Staff Management',
    description: 'Efficiently manage staff schedules, qualifications, and performance.',
    icon: Users,
    details: [
      'Shift planning and rotation',
      'Qualification tracking',
      'Training management',
      'Performance monitoring',
      'Staff communication tools'
    ]
  },
  {
    title: 'Incident Reporting',
    description: 'Track and manage incidents with detailed reporting and follow-up procedures.',
    icon: Bell,
    details: [
      'Incident logging and tracking',
      'Automated notifications',
      'Investigation workflows',
      'Action plan creation',
      'Trend analysis'
    ]
  },
  {
    title: 'Family Portal',
    description: 'Keep families connected with secure access to resident information.',
    icon: MessageSquare,
    details: [
      'Secure family access',
      'Photo and update sharing',
      'Message center',
      'Visit scheduling',
      'Care plan updates'
    ]
  },
  {
    title: 'Compliance & Auditing',
    description: 'Stay compliant with regulatory requirements and maintain quality standards.',
    icon: Shield,
    details: [
      'CQC compliance tools',
      'Audit trail maintenance',
      'Policy management',
      'Inspection preparation',
      'Quality assurance checks'
    ]
  },
  {
    title: 'Calendar & Scheduling',
    description: 'Manage appointments, activities, and important events efficiently.',
    icon: CalendarDays,
    details: [
      'Appointment scheduling',
      'Activity planning',
      'Visit management',
      'Reminder system',
      'Calendar sharing'
    ]
  },
  {
    title: 'Analytics & Reporting',
    description: 'Gain insights with comprehensive reporting and analytics tools.',
    icon: BarChart,
    details: [
      'Custom report generation',
      'Performance metrics',
      'Occupancy tracking',
      'Financial analytics',
      'Trend analysis'
    ]
  },
  {
    title: 'Document Management',
    description: 'Organize and manage all your care home documentation digitally.',
    icon: FileText,
    details: [
      'Digital document storage',
      'Version control',
      'Document sharing',
      'Template management',
      'Secure archiving'
    ]
  },
  {
    title: 'Real-time Updates',
    description: 'Stay informed with real-time updates and notifications.',
    icon: Clock,
    details: [
      'Live activity feed',
      'Instant notifications',
      'Status updates',
      'Alert system',
      'Task tracking'
    ]
  },
  {
    title: 'Mobile Access',
    description: 'Access your care home management system on any device.',
    icon: Smartphone,
    details: [
      'Mobile app access',
      'Cross-device sync',
      'Offline capabilities',
      'Responsive design',
      'Secure remote access'
    ]
  },
  {
    title: 'Data Security',
    description: 'Keep your data secure with enterprise-grade security features.',
    icon: Cloud,
    details: [
      'Data encryption',
      'Regular backups',
      'Access controls',
      'GDPR compliance',
      'Audit logging'
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Comprehensive Care Home Management Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Our platform provides everything you need to efficiently manage your care home,
            from resident care to staff scheduling and compliance.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/demo">Request Demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="mr-2 mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your care home?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of care homes already using our platform to provide better care.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
