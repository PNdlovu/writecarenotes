import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  Target,
  AlertCircle,
  FileText,
  Plus,
  Calendar,
  Award,
  AlertTriangle,
} from 'lucide-react';
import {
  PerformanceGoal,
  PerformanceReview,
  PerformanceIncident,
  PerformanceRating,
  ReviewType,
  GoalStatus,
} from '@/features/staff/types';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { formatDate } from '@/lib/utils';
import ReviewDialog from './performance/ReviewDialog';
import GoalDialog from './performance/GoalDialog';
import IncidentDialog from './performance/IncidentDialog';

interface PerformanceManagementPanelProps {
  staffId: string;
}

const PerformanceManagementPanel: React.FC<PerformanceManagementPanelProps> = ({
  staffId,
}) => {
  const [activeTab, setActiveTab] = useState('reviews');

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<PerformanceReview[]>({
    queryKey: ['performanceReviews', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/performance/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });

  const { data: goals, isLoading: isLoadingGoals } = useQuery<PerformanceGoal[]>({
    queryKey: ['performanceGoals', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/performance/goals`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      return response.json();
    },
  });

  const { data: incidents, isLoading: isLoadingIncidents } = useQuery<PerformanceIncident[]>({
    queryKey: ['performanceIncidents', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/performance/incidents`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      return response.json();
    },
  });

  const getRatingColor = (rating: PerformanceRating) => {
    const colors = {
      OUTSTANDING: 'bg-green-500',
      EXCEEDS_EXPECTATIONS: 'bg-blue-500',
      MEETS_EXPECTATIONS: 'bg-yellow-500',
      NEEDS_IMPROVEMENT: 'bg-orange-500',
      UNSATISFACTORY: 'bg-red-500',
    };
    return colors[rating] || 'bg-gray-500';
  };

  const getGoalStatusColor = (status: GoalStatus) => {
    const colors = {
      NOT_STARTED: 'bg-gray-500',
      IN_PROGRESS: 'bg-blue-500',
      COMPLETED: 'bg-green-500',
      CANCELLED: 'bg-red-500',
      DEFERRED: 'bg-yellow-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getIncidentSeverityColor = (severity: string) => {
    const colors = {
      LOW: 'bg-blue-500',
      MEDIUM: 'bg-yellow-500',
      HIGH: 'bg-orange-500',
      CRITICAL: 'bg-red-500',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Management</h2>
        <div className="space-x-2">
          <ReviewDialog staffId={staffId} />
          <GoalDialog staffId={staffId} />
          <IncidentDialog staffId={staffId} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">
            <FileText className="w-4 h-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertCircle className="w-4 h-4 mr-2" />
            Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {reviews?.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{review.type} Review</CardTitle>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.period.start)} - {formatDate(review.period.end)}
                    </p>
                  </div>
                  <Badge className={getRatingColor(review.rating)}>
                    {review.rating.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {review.scores.map((score, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{score.category}</span>
                          <span className="text-sm text-gray-500">{score.score}/5</span>
                        </div>
                        <Progress value={score.score * 20} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {goals?.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    <p className="text-sm text-gray-500">{goal.category}</p>
                  </div>
                  <Badge className={getGoalStatusColor(goal.status)}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{goal.description}</p>
                {goal.milestones && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex justify-between items-center">
                          <span className="text-sm">{milestone.title}</span>
                          <Badge className={getGoalStatusColor(milestone.status)}>
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {incidents?.map((incident) => (
            <Card key={incident.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {incident.type === 'RECOGNITION' ? (
                        <Award className="w-4 h-4 inline mr-2 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 inline mr-2 text-orange-500" />
                      )}
                      {incident.type}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{formatDate(incident.date)}</p>
                  </div>
                  {incident.severity && (
                    <Badge className={getIncidentSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{incident.description}</p>
                {incident.actions && incident.actions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      {incident.actions.map((action) => (
                        <div key={action.id} className="flex justify-between items-center">
                          <span className="text-sm">{action.description}</span>
                          <Badge
                            variant={action.status === 'COMPLETED' ? 'default' : 'secondary'}
                          >
                            {action.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceManagementPanel;


