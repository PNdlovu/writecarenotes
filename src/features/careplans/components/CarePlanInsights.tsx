import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Info
} from "lucide-react";

export function CarePlanInsights() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Care Plan Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {trends.map((trend) => (
              <Card key={trend.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{trend.title}</h3>
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">{trend.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{trend.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Key Observations</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {observations.map((observation) => (
                  <div key={observation.id} className="flex items-start gap-4">
                    {getObservationIcon(observation.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{observation.title}</h4>
                        <Badge variant={getObservationVariant(observation.type)}>
                          {observation.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {observation.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {recommendation.description}
                        </p>
                        <div className="flex justify-end mt-4">
                          <Button variant="outline" size="sm">
                            Take Action
                          </Button>
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

function getObservationIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'improvement':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'concern':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'critical':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

function getObservationVariant(type: string) {
  switch (type.toLowerCase()) {
    case 'improvement':
      return 'success';
    case 'concern':
      return 'warning';
    case 'critical':
      return 'destructive';
    default:
      return 'secondary';
  }
}

const trends = [
  {
    title: 'Care Plan Adherence',
    value: '94%',
    direction: 'up',
    description: 'Increased from 89% last month'
  },
  {
    title: 'Incident Rate',
    value: '2.3%',
    direction: 'down',
    description: 'Decreased from 3.1% last month'
  },
  {
    title: 'Resident Satisfaction',
    value: '4.8/5',
    direction: 'up',
    description: 'Improved from 4.6 last quarter'
  },
  {
    title: 'Staff Efficiency',
    value: '87%',
    direction: 'up',
    description: 'Up from 82% previous period'
  }
];

const observations = [
  {
    id: 1,
    type: 'Improvement',
    title: 'Medication Management',
    description: 'Significant improvement in medication administration accuracy'
  },
  {
    id: 2,
    type: 'Concern',
    title: 'Physical Activity',
    description: 'Slight decrease in participation in group activities'
  },
  {
    id: 3,
    type: 'Critical',
    title: 'Fall Risk',
    description: 'Increased fall risk identified in evening hours'
  }
];

const recommendations = [
  {
    id: 1,
    title: 'Review Activity Schedule',
    description: 'Consider adjusting activity times to increase participation rates'
  },
  {
    id: 2,
    title: 'Staff Training Update',
    description: 'Schedule refresher training on fall prevention protocols'
  },
  {
    id: 3,
    title: 'Care Plan Adjustment',
    description: 'Update mobility support requirements based on recent assessments'
  }
];
