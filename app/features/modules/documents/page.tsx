import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Search,
  Lock,
  Share2,
  History,
  Upload,
  FolderTree,
  Printer,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Document Management',
    description: 'Centralized storage for all care home documentation',
    icon: FileText,
    details: [
      'Secure document storage',
      'Version control',
      'Document categorization',
      'Quick access to frequently used documents',
      'Bulk document operations'
    ]
  },
  {
    title: 'Smart Search',
    description: 'Advanced search capabilities for quick document retrieval',
    icon: Search,
    details: [
      'Full-text search',
      'Filter by document type',
      'Date range search',
      'Tag-based search',
      'Recently accessed documents'
    ]
  },
  {
    title: 'Security & Compliance',
    description: 'Enhanced security features ensuring data protection',
    icon: Lock,
    details: [
      'Role-based access control',
      'Audit trails',
      'GDPR compliance',
      'Data encryption',
      'Secure backup'
    ]
  },
  {
    title: 'Sharing & Collaboration',
    description: 'Secure document sharing and collaboration tools',
    icon: Share2,
    details: [
      'Controlled sharing',
      'Document permissions',
      'External secure sharing',
      'Collaboration tools',
      'Comment and review system'
    ]
  },
  {
    title: 'Version Control',
    description: 'Track and manage document versions',
    icon: History,
    details: [
      'Version history',
      'Change tracking',
      'Document restoration',
      'Comparison tools',
      'Automatic versioning'
    ]
  },
  {
    title: 'Document Upload',
    description: 'Easy document upload and processing',
    icon: Upload,
    details: [
      'Drag and drop upload',
      'Bulk upload',
      'Document scanning',
      'Mobile upload',
      'Auto-categorization'
    ]
  },
  {
    title: 'Organization',
    description: 'Structured document organization system',
    icon: FolderTree,
    details: [
      'Custom folder structure',
      'Document tagging',
      'Smart folders',
      'Document templates',
      'Archive management'
    ]
  },
  {
    title: 'Output & Reports',
    description: 'Comprehensive document output options',
    icon: Printer,
    details: [
      'Custom report generation',
      'Batch printing',
      'Export options',
      'Document merging',
      'Digital signatures'
    ]
  }
];

export default function DocumentFeatures() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Document Management System</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our powerful document management system helps you organize, secure, and 
            access all your care home documentation efficiently and securely.
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
            See our document management system in action. Book a demo today.
          </p>
        </div>
      </div>
    </div>
  );
}
