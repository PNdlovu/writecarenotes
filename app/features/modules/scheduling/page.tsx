import { FeatureCard } from '@/components/features/FeatureCard';
import { ModuleHero } from '@/components/features/ModuleHero';
import {
  Calendar,
  Clock,
  Users,
  ArrowLeftRight,
  BarChart2,
  MessageSquare,
  Shield,
  Settings,
} from 'lucide-react';

const features = [
  {
    title: 'Rota Planning',
    description: 'Efficient staff scheduling and rota management',
    icon: Calendar,
    details: [
      'Drag-and-drop scheduling',
      'Shift pattern templates',
      'Holiday management',
      'Availability tracking',
      'Auto-scheduling features'
    ]
  },
  {
    title: 'Time & Attendance',
    description: 'Track staff attendance and working hours',
    icon: Clock,
    details: [
      'Digital clock in/out',
      'Break management',
      'Overtime tracking',
      'Absence recording',
      'Real-time attendance monitoring'
    ]
  },
  {
    title: 'Staff Management',
    description: 'Comprehensive staff information and skills tracking',
    icon: Users,
    details: [
      'Staff profiles',
      'Qualification tracking',
      'Training records',
      'Performance monitoring',
      'Document management'
    ]
  },
  {
    title: 'Shift Management',
    description: 'Dynamic shift allocation and management',
    icon: ArrowLeftRight,
    details: [
      'Shift swapping',
      'Cover management',
      'Emergency staffing',
      'Skill matching',
      'Workload balancing'
    ]
  },
  {
    title: 'Analytics & Reporting',
    description: 'Detailed insights into scheduling and attendance',
    icon: BarChart2,
    details: [
      'Staff utilization reports',
      'Cost analysis',
      'Attendance patterns',
      'Performance metrics',
      'Custom reporting'
    ]
  },
  {
    title: 'Communication',
    description: 'Integrated staff communication tools',
    icon: MessageSquare,
    details: [
      'Shift notifications',
      'Team messaging',
      'Announcement broadcasts',
      'Document sharing',
      'Mobile app access'
    ]
  },
  {
    title: 'Compliance Management',
    description: 'Ensure scheduling meets regulatory requirements',
    icon: Shield,
    details: [
      'Working time regulations',
      'Break compliance',
      'Qualification checking',
      'Audit trails',
      'Policy enforcement'
    ]
  },
  {
    title: 'Configuration',
    description: 'Customize scheduling rules and settings',
    icon: Settings,
    details: [
      'Shift patterns setup',
      'Role configuration',
      'Department settings',
      'Pay rate management',
      'Integration options'
    ]
  }
];

export default function StaffSchedulingFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <ModuleHero
          title="Staff Scheduling System"
          description="Streamline your staff scheduling process with our comprehensive system 
            that handles everything from rota planning to compliance management."
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
      </div>
    </div>
  );
}
