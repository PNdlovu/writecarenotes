import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  RefreshCw,
  Calendar,
  Settings,
  Users,
  AlertTriangle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion";

export function CarePlanOptimization() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Care Plan Optimization</CardTitle>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {optimizationMetrics.map((metric) => (
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
            <Accordion type="single" collapsible className="w-full">
              {optimizationItems.map((item) => (
                <AccordionItem key={item.id} value={item.id.toString()}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      {getItemIcon(item.type)}
                      <div>
                        <h3 className="font-medium text-left">{item.title}</h3>
                        <p className="text-sm text-gray-500 text-left">{item.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-center">
                        <Badge variant={getItemVariant(item.priority)}>
                          {item.priority} Priority
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Last updated: {item.lastUpdated}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Recommendations:</h4>
                        <ul className="space-y-2">
                          {item.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-sm">{rec}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Dismiss</Button>
                        <Button size="sm">Apply Changes</Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

function getItemIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'schedule':
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case 'staff':
      return <Users className="h-5 w-5 text-green-500" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Settings className="h-5 w-5 text-gray-500" />;
  }
}

function getItemVariant(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    default:
      return 'secondary';
  }
}

const optimizationMetrics = [
  {
    title: 'Optimization Score',
    value: '89%',
    progress: 89
  },
  {
    title: 'Implementation Rate',
    value: '76%',
    progress: 76
  },
  {
    title: 'Efficiency Gain',
    value: '23%',
    progress: 23
  }
];

const optimizationItems = [
  {
    id: 1,
    type: 'schedule',
    title: 'Care Schedule Optimization',
    description: 'Suggested improvements to care delivery timing',
    priority: 'High',
    lastUpdated: '2 hours ago',
    recommendations: [
      'Adjust medication schedule to align with staff handovers',
      'Consolidate similar care tasks to reduce interruptions',
      'Optimize meal times based on resident preferences'
    ]
  },
  {
    id: 2,
    type: 'staff',
    title: 'Staff Allocation',
    description: 'Resource distribution recommendations',
    priority: 'Medium',
    lastUpdated: '1 day ago',
    recommendations: [
      'Redistribute morning shift assignments for better coverage',
      'Cross-train staff for improved flexibility',
      'Adjust skill mix during peak hours'
    ]
  },
  {
    id: 3,
    type: 'alert',
    title: 'Care Quality Enhancement',
    description: 'Opportunities for care quality improvement',
    priority: 'High',
    lastUpdated: '3 hours ago',
    recommendations: [
      'Implement additional monitoring for high-risk residents',
      'Enhance documentation quality in specific areas',
      'Review and update care protocols'
    ]
  }
];
