import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import {
  BarChart,
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Badge } from '@/components/ui/Badge/Badge';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssessmentSummary {
  id: string;
  title: string;
  date: Date;
  status: 'pending' | 'completed' | 'overdue';
  score?: number;
  participants: number;
}

interface DashboardMetrics {
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  overdueAssessments: number;
  averageScore?: number;
  completionRate: number;
}

interface AssessmentDashboardProps {
  metrics: DashboardMetrics;
  recentAssessments: AssessmentSummary[];
  upcomingAssessments: AssessmentSummary[];
  onViewAssessment: (id: string) => void;
  onCreateAssessment: () => void;
}

export function AssessmentDashboard({
  metrics,
  recentAssessments,
  upcomingAssessments,
  onViewAssessment,
  onCreateAssessment,
}: AssessmentDashboardProps) {
  const getStatusIcon = (status: AssessmentSummary['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Assessments
              </p>
              <h3 className="text-2xl font-bold">{metrics.totalAssessments}</h3>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="truncate">
              {metrics.completionRate}% completion rate
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <h3 className="text-2xl font-bold text-green-600">
                {metrics.completedAssessments}
              </h3>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          {metrics.averageScore !== undefined && (
            <div className="mt-4 flex items-center text-sm">
              <div className="truncate">
                {metrics.averageScore}% average score
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <h3 className="text-2xl font-bold text-yellow-600">
                {metrics.pendingAssessments}
              </h3>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="truncate">Awaiting completion</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overdue
              </p>
              <h3 className="text-2xl font-bold text-red-600">
                {metrics.overdueAssessments}
              </h3>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="truncate">Requires immediate attention</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Assessments</h3>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onViewAssessment(assessment.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(assessment.status)}
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(assessment.date, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  {assessment.score !== undefined && (
                    <Badge variant="secondary">
                      Score: {assessment.score}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Upcoming Assessments</h3>
            <Button onClick={onCreateAssessment} size="sm">
              Create New
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {upcomingAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onViewAssessment(assessment.id)}
                >
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{format(assessment.date, 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {assessment.participants}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}


