import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Settings,
  Users,
  Shield,
  Palette,
  Database,
  Workflow,
  Globe,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'System Configuration',
    description: 'Customize the system to your needs',
    icon: Settings,
    details: [
      'Module activation',
      'Feature customization',
      'Workflow configuration',
      'Integration settings',
      'System preferences'
    ]
  },
  {
    title: 'User Management',
    description: 'Comprehensive user control system',
    icon: Users,
    details: [
      'Role management',
      'Permission settings',
      'User groups',
      'Access control',
      'User authentication'
    ]
  },
  {
    title: 'Security Settings',
    description: 'Advanced security configuration',
    icon: Shield,
    details: [
      'Security policies',
      'Password rules',
      'Two-factor authentication',
      'Session management',
      'Audit logging'
    ]
  },
  {
    title: 'Customization',
    description: 'Personalize your care home system',
    icon: Palette,
    details: [
      'Branding options',
      'Custom forms',
      'Report templates',
      'Dashboard layouts',
      'Email templates'
    ]
  },
  {
    title: 'Data Management',
    description: 'Control your care home data',
    icon: Database,
    details: [
      'Data retention',
      'Backup settings',
      'Archive options',
      'Import/Export tools',
      'Data cleanup'
    ]
  },
  {
    title: 'Workflow Settings',
    description: 'Configure operational workflows',
    icon: Workflow,
    details: [
      'Approval processes',
      'Task automation',
      'Notification rules',
      'Escalation paths',
      'Custom workflows'
    ]
  },
  {
    title: 'Localization',
    description: 'Regional and language settings',
    icon: Globe,
    details: [
      'Language settings',
      'Time zone configuration',
      'Regional formats',
      'Currency options',
      'Local regulations'
    ]
  },
  {
    title: 'Integration Settings',
    description: 'Configure system integrations',
    icon: Zap,
    details: [
      'API configuration',
      'Third-party integrations',
      'Data synchronization',
      'Connection management',
      'Integration monitoring'
    ]
  }
];

export default function SettingsFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">System Settings</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive system configuration tools to customize and optimize your 
            care home management system according to your specific needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
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
                  <CardDescription className="text-base mb-4">
                    {feature.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center space-y-4">
          <Button asChild size="lg">
            <Link href="/demo">Request a Demo</Link>
          </Button>
          <p className="text-muted-foreground">
            See how our flexible configuration options can adapt to your needs. Book a demo today.
          </p>
        </div>
      </div>
    </div>
  );
}
