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
  Tool,
  Bed,
  Warehouse,
  ClipboardList,
  Receipt,
  AlertTriangle,
  LineChart,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Room Management',
    description: 'Efficient room and bed management system',
    icon: Building2,
    details: [
      'Room allocation',
      'Bed tracking',
      'Occupancy management',
      'Room features inventory',
      'Virtual room tours'
    ]
  },
  {
    title: 'Maintenance',
    description: 'Comprehensive maintenance management',
    icon: Tool,
    details: [
      'Maintenance scheduling',
      'Work order management',
      'Contractor coordination',
      'Preventive maintenance',
      'Emergency repairs'
    ]
  },
  {
    title: 'Facilities',
    description: 'Track and manage care home facilities',
    icon: Bed,
    details: [
      'Facility scheduling',
      'Equipment tracking',
      'Cleaning schedules',
      'Safety checks',
      'Facility booking'
    ]
  },
  {
    title: 'Asset Management',
    description: 'Track and maintain care home assets',
    icon: Warehouse,
    details: [
      'Asset tracking',
      'Inventory management',
      'Equipment maintenance',
      'Asset lifecycle',
      'Depreciation tracking'
    ]
  },
  {
    title: 'Inspections',
    description: 'Regular property inspection tools',
    icon: ClipboardList,
    details: [
      'Safety inspections',
      'Quality checks',
      'Compliance audits',
      'Environmental monitoring',
      'Inspection reports'
    ]
  },
  {
    title: 'Cost Management',
    description: 'Track and manage property costs',
    icon: Receipt,
    details: [
      'Budget tracking',
      'Cost analysis',
      'Vendor management',
      'Invoice processing',
      'Financial reporting'
    ]
  },
  {
    title: 'Risk Assessment',
    description: 'Property risk management tools',
    icon: AlertTriangle,
    details: [
      'Risk assessments',
      'Safety compliance',
      'Environmental risks',
      'Security management',
      'Emergency planning'
    ]
  },
  {
    title: 'Analytics',
    description: 'Property performance analytics',
    icon: LineChart,
    details: [
      'Occupancy trends',
      'Maintenance metrics',
      'Cost analysis',
      'Resource utilization',
      'Performance reporting'
    ]
  }
];

export default function PropertyFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Property Management</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our property management system helps you maintain and optimize your care home 
            facilities while ensuring safety, compliance, and cost-effectiveness.
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
            See how our property management system can help maintain your care home. Book a demo today.
          </p>
        </div>
      </div>
    </div>
  );
}
