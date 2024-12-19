import { FeatureCard } from '@/components/features/FeatureCard';
import { ModuleHero } from '@/components/features/ModuleHero';
import {
  FileText,
  ClipboardCheck,
  Search,
  BarChart2,
  Bell,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    title: 'Incident Logging',
    description: 'Comprehensive incident recording system',
    icon: FileText,
    details: [
      'Quick incident entry',
      'Customizable forms',
      'Photo/document attachments',
      'Location tracking',
      'Severity classification'
    ]
  },
  {
    title: 'Documentation',
    description: 'Detailed incident documentation tools',
    icon: ClipboardCheck,
    details: [
      'Witness statements',
      'Action tracking',
      'Follow-up records',
      'Electronic signatures',
      'Document templates'
    ]
  },
  {
    title: 'Investigation Tools',
    description: 'Thorough incident investigation support',
    icon: Search,
    details: [
      'Root cause analysis',
      'Timeline creation',
      'Evidence collection',
      'Interview records',
      'Corrective actions'
    ]
  },
  {
    title: 'Analytics & Reporting',
    description: 'Comprehensive incident analysis tools',
    icon: BarChart2,
    details: [
      'Trend analysis',
      'Statistical reporting',
      'Custom dashboards',
      'Export capabilities',
      'Comparative analysis'
    ]
  },
  {
    title: 'Notifications',
    description: 'Automated alert and notification system',
    icon: Bell,
    details: [
      'Real-time alerts',
      'Escalation protocols',
      'Team notifications',
      'Status updates',
      'Mobile notifications'
    ]
  },
  {
    title: 'Quality Assurance',
    description: 'Maintain high standards of incident management',
    icon: ShieldCheck,
    details: [
      'Compliance checking',
      'Review workflows',
      'Quality metrics',
      'Audit trails',
      'Best practice guidance'
    ]
  },
  {
    title: 'Risk Management',
    description: 'Proactive risk assessment and mitigation',
    icon: AlertTriangle,
    details: [
      'Risk assessments',
      'Prevention strategies',
      'Control measures',
      'Risk matrices',
      'Mitigation tracking'
    ]
  },
  {
    title: 'Continuous Improvement',
    description: 'Drive ongoing safety and quality improvements',
    icon: TrendingUp,
    details: [
      'Improvement tracking',
      'Action planning',
      'Learning outcomes',
      'Performance monitoring',
      'Success metrics'
    ]
  }
];

export default function IncidentReportingFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <ModuleHero
          title="Incident Reporting System"
          description="Comprehensive incident management system for recording, investigating, 
            and preventing incidents while ensuring compliance and continuous improvement."
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
