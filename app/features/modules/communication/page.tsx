import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MessageSquare,
  Users,
  Bell,
  Calendar,
  Image,
  Shield,
  Smartphone,
  Languages,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Internal Messaging',
    description: 'Secure staff communication platform',
    icon: MessageSquare,
    details: [
      'Real-time messaging',
      'Team channels',
      'Shift handover notes',
      'File sharing',
      'Message prioritization'
    ]
  },
  {
    title: 'Family Portal',
    description: 'Keep families connected and informed',
    icon: Users,
    details: [
      'Regular updates',
      'Photo sharing',
      'Care plan updates',
      'Visit scheduling',
      'Direct messaging'
    ]
  },
  {
    title: 'Notifications',
    description: 'Smart notification system',
    icon: Bell,
    details: [
      'Customizable alerts',
      'Priority notifications',
      'Read receipts',
      'Delivery confirmation',
      'Notification preferences'
    ]
  },
  {
    title: 'Event Management',
    description: 'Organize and communicate events',
    icon: Calendar,
    details: [
      'Activity calendar',
      'Event notifications',
      'RSVP management',
      'Reminder system',
      'Event updates'
    ]
  },
  {
    title: 'Media Sharing',
    description: 'Secure media sharing platform',
    icon: Image,
    details: [
      'Photo galleries',
      'Video updates',
      'Document sharing',
      'Media organization',
      'Privacy controls'
    ]
  },
  {
    title: 'Privacy & Security',
    description: 'Secure communication channels',
    icon: Shield,
    details: [
      'End-to-end encryption',
      'Data protection',
      'Access controls',
      'Audit trails',
      'Compliance features'
    ]
  },
  {
    title: 'Mobile Access',
    description: 'Stay connected on the go',
    icon: Smartphone,
    details: [
      'Mobile app access',
      'Push notifications',
      'Offline access',
      'Cross-device sync',
      'Mobile optimization'
    ]
  },
  {
    title: 'Accessibility',
    description: 'Inclusive communication features',
    icon: Languages,
    details: [
      'Multiple languages',
      'Text-to-speech',
      'Large text options',
      'Screen reader support',
      'Accessibility tools'
    ]
  }
];

export default function CommunicationFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Communication Platform</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our integrated communication platform connects staff, residents, and families, 
            ensuring everyone stays informed and engaged in resident care.
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
            Experience how our communication platform can improve coordination and engagement. Book a demo today.
          </p>
        </div>
      </div>
    </div>
  );
}
