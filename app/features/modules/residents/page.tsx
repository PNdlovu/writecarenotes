import { FeatureCard } from '@/components/features/FeatureCard';
import { ModuleHero } from '@/components/features/ModuleHero';
import {
  Users,
  ClipboardCheck,
  Activity,
  Pills,
  Calendar,
  MessageSquare,
  FileText,
  AlertCircle,
} from 'lucide-react';

const features = [
  {
    title: 'Resident Profiles',
    description: 'Comprehensive digital profiles including personal details, preferences, and medical history',
    icon: Users,
    details: [
      'Personal and medical information',
      'Family contact details',
      'Preferences and requirements',
      'Photo identification',
      'Room assignment'
    ]
  },
  {
    title: 'Care Plans',
    description: 'Detailed care planning and assessment tools for personalized resident care',
    icon: ClipboardCheck,
    details: [
      'Customizable care plan templates',
      'Risk assessments',
      'Regular reviews and updates',
      'Care goals tracking',
      'Historical care records'
    ]
  },
  {
    title: 'Health Monitoring',
    description: 'Track and monitor resident health metrics',
    icon: Activity,
    details: [
      'Vital signs tracking',
      'Weight tracking',
      'Mood and behavior monitoring',
      'Sleep patterns',
      'Pain management'
    ]
  },
  {
    title: 'Medication Management',
    description: 'Complete medication administration and tracking system',
    icon: Pills,
    details: [
      'Medication schedules',
      'MAR charts',
      'Medication stock control',
      'PRN medication tracking',
      'Medication reviews'
    ]
  },
  {
    title: 'Appointments',
    description: 'Schedule and track medical appointments and check-ups',
    icon: Calendar,
    details: [
      'GP appointments',
      'Specialist visits',
      'Health check reminders',
      'Transport arrangements',
      'Appointment outcomes'
    ]
  },
  {
    title: 'Family Portal',
    description: 'Secure communication platform for families to stay updated',
    icon: MessageSquare,
    details: [
      'Regular updates',
      'Photo sharing',
      'Message center',
      'Visit scheduling',
      'Care plan reviews'
    ]
  },
  {
    title: 'Documentation',
    description: 'Secure storage for all resident-related documents',
    icon: FileText,
    details: [
      'Medical records',
      'Legal documents',
      'Care assessments',
      'Incident reports',
      'Consent forms'
    ]
  },
  {
    title: 'Incident Reporting',
    description: 'Quick and detailed incident logging specific to residents',
    icon: AlertCircle,
    details: [
      'Incident logging',
      'Fall records',
      'Behavior incidents',
      'Investigation tools',
      'Follow-up tracking'
    ]
  }
];

export default function ResidentFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <ModuleHero
          title="Resident Management"
          description="Our comprehensive resident management system helps you provide personalized care 
            while maintaining detailed records and ensuring efficient communication."
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
