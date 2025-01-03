import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Progress } from "@/components/ui/Progress/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { 
  MoreVertical, 
  Download, 
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function ComplianceDashboard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Compliance Dashboard</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View All</DropdownMenuItem>
                <DropdownMenuItem>Generate Report</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {complianceMetrics.map((metric) => (
              <Card key={metric.title}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold mb-2">{metric.value}</div>
                  <p className="text-sm text-gray-500">{metric.title}</p>
                  <Progress 
                    value={metric.progress} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {complianceItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <h3 className="font-medium">{item.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Last updated: {item.lastUpdated}
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'compliant':
      return 'success';
    case 'pending':
      return 'warning';
    case 'non-compliant':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'compliant':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'non-compliant':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

const complianceMetrics = [
  {
    title: 'Overall Compliance',
    value: '92%',
    progress: 92
  },
  {
    title: 'Documentation Complete',
    value: '87%',
    progress: 87
  },
  {
    title: 'Staff Training',
    value: '95%',
    progress: 95
  }
];

const complianceItems = [
  {
    id: 1,
    title: 'Care Plan Reviews',
    description: 'All resident care plans are up to date and reviewed within required timeframes',
    status: 'Compliant',
    lastUpdated: '2 days ago'
  },
  {
    id: 2,
    title: 'Medication Management',
    description: 'Medication administration records require review and updates',
    status: 'Pending',
    lastUpdated: '1 day ago'
  },
  {
    id: 3,
    title: 'Staff Certifications',
    description: 'Some staff members have certifications expiring soon',
    status: 'Non-Compliant',
    lastUpdated: '3 days ago'
  },
  {
    id: 4,
    title: 'Health & Safety',
    description: 'All safety protocols and procedures are being followed correctly',
    status: 'Compliant',
    lastUpdated: '1 week ago'
  }
];
