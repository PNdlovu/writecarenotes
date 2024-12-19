import { FeatureCard } from '@/components/features/FeatureCard';
import { ModuleHero } from '@/components/features/ModuleHero';
import {
  ClipboardList,
  Activity,
  Target,
  History,
  Bell,
  Users,
  FileCheck,
  Share2,
} from 'lucide-react';

const features = [
  {
    title: 'Care Plan Creation',
    description: 'Comprehensive care plan development tools',
    icon: ClipboardList,
    details: [
      'Customizable care plan templates',
      'Person-centered planning tools',
      'Risk assessment integration',
      'Goal setting and tracking',
      'Multi-disciplinary input'
    ]
  },
  {
    title: 'Health Monitoring',
    description: 'Track and monitor resident health metrics',
    icon: Activity,
    details: [
      'Vital signs tracking',
      'Medication management',
      'Wound care monitoring',
      'Nutrition tracking',
      'Behavior monitoring'
    ]
  },
  {
    title: 'Goals & Outcomes',
    description: 'Set and track resident care goals',
    icon: Target,
    details: [
      'Personalized goal setting',
      'Progress tracking',
      'Outcome measurements',
      'Achievement reporting',
      'Care quality indicators'
    ]
  },
  {
    title: 'Care History',
    description: 'Comprehensive care history tracking',
    icon: History,
    details: [
      'Historical care records',
      'Treatment tracking',
      'Intervention history',
      'Progress notes',
      'Care review timeline'
    ]
  },
  {
    title: 'Alerts & Reminders',
    description: 'Stay on top of care tasks and reviews',
    icon: Bell,
    details: [
      'Care task reminders',
      'Review due dates',
      'Assessment schedules',
      'Medical appointment alerts',
      'Care plan updates'
    ]
  },
  {
    title: 'Multi-disciplinary Care',
    description: 'Coordinate care across different professionals',
    icon: Users,
    details: [
      'Team collaboration tools',
      'Professional input tracking',
      'Specialist recommendations',
      'Care team communication',
      'Role-based access'
    ]
  },
  {
    title: 'Compliance & Quality',
    description: 'Ensure care meets regulatory standards',
    icon: FileCheck,
    details: [
      'CQC compliance tools',
      'Quality assurance checks',
      'Policy adherence',
      'Audit preparation',
      'Best practice guidance'
    ]
  },
  {
    title: 'Family Involvement',
    description: 'Keep families involved in care planning',
    icon: Share2,
    details: [
      'Family portal access',
      'Care plan sharing',
      'Update notifications',
      'Feedback collection',
      'Meeting scheduling'
    ]
  }
];

export default function CarePlanFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <ModuleHero
          title="Care Planning System"
          description="Our comprehensive care planning system helps you create, manage, and monitor 
            personalized care plans while ensuring regulatory compliance and quality care delivery."
        />

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              index={index}
              {...feature}
            />
          ))}
        </div>

        <div className="mt-12 text-center space-y-4">
          <Button asChild size="lg">
            <Link href="/demo">Request a Demo</Link>
          </Button>
          <p className="text-muted-foreground">
            See how our care planning system can improve your care delivery. Book a demo today.
          </p>
        </div>
      </div>
    </div>
  );
}
