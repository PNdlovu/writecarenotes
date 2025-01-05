import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress/Progress";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function PredictiveCareNeeds() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Predictive Care Needs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {predictiveMetrics.map((metric) => (
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

          <div>
            <h3 className="text-lg font-medium mb-4">Care Timeline</h3>
            <ScrollArea className="h-[400px]">
              <div className="relative">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="mb-8 last:mb-0">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                        {getEventIcon(event.type)}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div className="absolute h-[calc(100%-32px)] w-px bg-gray-200 left-4 top-8" />
                      )}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">{event.description}</p>
                          </div>
                          <Badge variant={getEventVariant(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="mr-2 h-4 w-4" />
                          {event.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {getRecommendationIcon(recommendation.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge variant={getPriorityVariant(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {recommendation.description}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm">Take Action</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getEventIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'prediction':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

function getEventVariant(type: string) {
  switch (type.toLowerCase()) {
    case 'prediction':
      return 'warning';
    case 'completed':
      return 'success';
    default:
      return 'secondary';
  }
}

function getRecommendationIcon(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
}

function getPriorityVariant(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    default:
      return 'secondary';
  }
}

const predictiveMetrics = [
  {
    title: 'Care Plan Accuracy',
    value: '94%',
    progress: 94
  },
  {
    title: 'Prediction Confidence',
    value: '87%',
    progress: 87
  },
  {
    title: 'Implementation Rate',
    value: '91%',
    progress: 91
  }
];

const timelineEvents = [
  {
    id: 1,
    type: 'Prediction',
    title: 'Mobility Support Need',
    description: 'Predicted increase in mobility support requirements',
    time: 'Predicted for next week'
  },
  {
    id: 2,
    type: 'Completed',
    title: 'Medication Review',
    description: 'Scheduled medication review completed',
    time: '2 hours ago'
  },
  {
    id: 3,
    type: 'Prediction',
    title: 'Nutrition Support',
    description: 'Potential changes in dietary requirements',
    time: 'Predicted for next month'
  }
];

const recommendations = [
  {
    id: 1,
    title: 'Update Mobility Care Plan',
    description: 'Review and adjust mobility support based on recent observations',
    priority: 'High'
  },
  {
    id: 2,
    title: 'Schedule Dietary Assessment',
    description: 'Arrange consultation with nutritionist for dietary review',
    priority: 'Medium'
  },
  {
    id: 3,
    title: 'Monitor Sleep Pattern',
    description: 'Implement sleep quality monitoring for the next week',
    priority: 'Low'
  }
];
