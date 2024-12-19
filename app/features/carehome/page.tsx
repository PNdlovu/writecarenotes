import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building2,
  Users,
  ClipboardList,
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Resident Management',
    description: 'Comprehensive resident profiles, care plans, and medical records management',
    icon: Users,
    link: '/features/modules/residents'
  },
  {
    title: 'Staff Scheduling',
    description: 'Efficient staff rota management and shift planning',
    icon: Calendar,
    link: '/features/modules/scheduling'
  },
  {
    title: 'Care Planning',
    description: 'Detailed care plans and assessments with regular updates',
    icon: ClipboardList,
    link: '/features/modules/care-plans'
  },
  {
    title: 'Incident Reporting',
    description: 'Quick and detailed incident logging and follow-up system',
    icon: Bell,
    link: '/features/modules/incidents'
  },
  {
    title: 'Documentation',
    description: 'Secure storage and management of all care home documentation',
    icon: FileText,
    link: '/features/modules/documents'
  },
  {
    title: 'Communication',
    description: 'Internal messaging and family portal for updates',
    icon: MessageSquare,
    link: '/features/modules/communication'
  },
  {
    title: 'Property Management',
    description: 'Maintenance tracking and room management',
    icon: Building2,
    link: '/features/modules/property'
  },
  {
    title: 'Settings & Configuration',
    description: 'Customize the system to your care home\'s needs',
    icon: Settings,
    link: '/features/modules/settings'
  }
];

export default function CareHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Care Home Management Features</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to run your care home efficiently and provide the best care for your residents
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href={feature.link}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/demo">Request a Demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
