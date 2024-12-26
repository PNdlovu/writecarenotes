import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  HeartPulse, 
  HelpCircle, 
  Shield,
  Search,
  Users,
  FileText,
  Video,
  Bell,
  Calendar,
  UserPlus,
  Building2,
  Award,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Care Documentation Resources | Write Care Notes',
  description: 'Enterprise-grade documentation resources and solutions for care homes, nursing facilities, and healthcare organizations.',
};

const sections = [
  {
    title: 'Care Solutions',
    description: 'Find the right documentation tools for your care service',
    href: '/resources/solutions',
    icon: HeartPulse,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
  {
    title: 'Documentation',
    description: 'Care plans, assessments, and daily records',
    href: '/resources/documentation',
    icon: ClipboardList,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Best Practices',
    description: 'Guidelines for quality care documentation',
    href: '/resources/best-practices',
    icon: BookOpen,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Staff Management',
    description: 'Tools for recruitment, training, and performance tracking',
    href: '/resources/staff-management',
    icon: UserPlus,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
  },
  {
    title: 'Training Library',
    description: 'CPD certified courses and learning materials',
    href: '/resources/training',
    icon: GraduationCap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Care Quality',
    description: 'CQC compliance and quality assurance',
    href: '/resources/care-quality',
    icon: Shield,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step guidance on care procedures',
    href: '/resources/videos',
    icon: Video,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    title: 'Templates',
    description: 'Downloadable forms and assessment templates',
    href: '/resources/templates',
    icon: FileText,
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
  {
    title: 'Regulatory Updates',
    description: 'Latest care sector regulations and guidance',
    href: '/resources/regulatory-updates',
    icon: Bell,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Rota Management',
    description: 'Staff scheduling and rota planning guides',
    href: '/resources/staff-management/rota',
    icon: Calendar,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
  {
    title: 'Team Support',
    description: 'Collaboration and communication tools',
    href: '/resources/team-support',
    icon: Users,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'FAQs',
    description: 'Answers to common questions',
    href: '/resources/faqs',
    icon: HelpCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
];

const trustStats = [
  {
    stat: '1000+',
    label: 'Care Homes',
    description: 'Trust our platform'
  },
  {
    stat: '50,000+',
    label: 'Care Staff',
    description: 'Using our solutions daily'
  },
  {
    stat: '99.9%',
    label: 'Uptime',
    description: 'Reliable service'
  },
  {
    stat: 'CQC',
    label: 'Compliant',
    description: 'Meeting standards'
  }
];

const certifications = [
  'ISO 27001 Certified',
  'GDPR Compliant',
  'NHS DSP Toolkit',
  'Cyber Essentials Plus'
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/20">
      <div className="relative overflow-hidden">
        {/* Hero Section with Background Pattern */}
        <div className="absolute inset-0 bg-grid-gray-100/25 bg-[size:20px_20px] [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <div className="container mx-auto px-4 py-16 relative">
          {/* Enterprise Badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="outline" className="text-blue-600 border-blue-200 py-1 px-4 text-sm font-medium">
              Trusted by Leading Care Organizations
            </Badge>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Enterprise Care Documentation Resources
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive documentation solutions designed for care homes, nursing facilities, and healthcare organizations.
            </p>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {trustStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stat.stat}</div>
                  <div className="font-semibold text-gray-900">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.description}</div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-500" />
                  {cert}
                </div>
              ))}
            </div>
          </div>

          {/* Search Section with Enterprise Context */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Resource Library</h2>
              <p className="text-gray-600">
                Access our comprehensive collection of care documentation resources
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search enterprise resources, templates, and guides..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Resources Grid with Enterprise Context */}
          <div className="max-w-7xl mx-auto">
            {/* Featured Solutions Banner */}
            <div className="bg-blue-50 rounded-lg p-6 mb-12">
              <div className="flex items-center gap-4 mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">Enterprise Solutions</h2>
                  <p className="text-blue-700">Tailored for multi-site care organizations</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Multi-site Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Centralized Reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Custom Workflows</span>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Link key={section.title} href={section.href}>
                    <Card className="p-6 h-full hover:shadow-lg transition-all hover:-translate-y-1 border-gray-100">
                      <div className="flex flex-col h-full">
                        <div className={`${section.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                          <Icon className={`h-6 w-6 ${section.color}`} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                        <p className="text-gray-600 mb-4 flex-grow">{section.description}</p>
                        <Button variant="ghost" className="justify-start p-0 hover:bg-transparent">
                          Learn more <span className="ml-2">→</span>
                        </Button>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Enterprise Support Banner */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <Award className="h-12 w-12 text-white/90 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Enterprise Support & Consultation
              </h2>
              <p className="text-blue-100 mb-6">
                Get personalized support and consultation for your organization's specific needs
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/enterprise">Book a Consultation</Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-blue-500" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-16 text-center">
            <p className="text-gray-600">
              Need specialized assistance?
            </p>
            <Button variant="link" asChild className="text-blue-500 hover:text-blue-600">
              <Link href="/support">Contact our enterprise support team</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
