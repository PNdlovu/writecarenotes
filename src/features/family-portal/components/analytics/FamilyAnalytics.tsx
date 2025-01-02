import React from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";

interface AnalyticsData {
  visitMetrics: {
    totalVisits: number;
    averageDuration: number;
    mostFrequentVisitor: string;
    upcomingVisits: number;
  };
  communicationMetrics: {
    totalMessages: number;
    responseRate: number;
    averageResponseTime: string;
    unreadMessages: number;
  };
  careMetrics: {
    medicationAdherence: number;
    appointmentsAttended: number;
    wellnessScore: number;
    activitiesParticipation: number;
  };
  familyEngagement: {
    activeMembers: number;
    documentShares: number;
    decisionParticipation: number;
    feedbackSubmitted: number;
  };
}

interface FamilyAnalyticsProps {
  residentId: string;
  familyMemberId: string;
}

export const FamilyAnalytics: React.FC<FamilyAnalyticsProps> = ({
  residentId,
  familyMemberId,
}) => {
  // Mock data - replace with actual API calls
  const analyticsData: AnalyticsData = {
    visitMetrics: {
      totalVisits: 24,
      averageDuration: 45,
      mostFrequentVisitor: 'Jane Doe',
      upcomingVisits: 3,
    },
    communicationMetrics: {
      totalMessages: 156,
      responseRate: 95,
      averageResponseTime: '2 hours',
      unreadMessages: 2,
    },
    careMetrics: {
      medicationAdherence: 98,
      appointmentsAttended: 12,
      wellnessScore: 85,
      activitiesParticipation: 75,
    },
    familyEngagement: {
      activeMembers: 5,
      documentShares: 34,
      decisionParticipation: 90,
      feedbackSubmitted: 15,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Family Analytics</h2>
          <p className="text-muted-foreground">
            Track and analyze family engagement and care metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visit Metrics */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Visit Metrics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{analyticsData.visitMetrics.totalVisits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Duration</p>
              <p className="text-2xl font-bold">{analyticsData.visitMetrics.averageDuration} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Frequent Visitor</p>
              <p className="text-lg font-semibold">{analyticsData.visitMetrics.mostFrequentVisitor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Visits</p>
              <p className="text-2xl font-bold">{analyticsData.visitMetrics.upcomingVisits}</p>
            </div>
          </div>
        </Card>

        {/* Communication Metrics */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Communication</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">{analyticsData.communicationMetrics.totalMessages}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold">{analyticsData.communicationMetrics.responseRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Response Time</p>
              <p className="text-lg font-semibold">{analyticsData.communicationMetrics.averageResponseTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
              <Badge variant={analyticsData.communicationMetrics.unreadMessages > 0 ? "destructive" : "default"}>
                {analyticsData.communicationMetrics.unreadMessages}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Care Metrics */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Care Metrics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Medication Adherence</p>
              <p className="text-2xl font-bold">{analyticsData.careMetrics.medicationAdherence}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Appointments Attended</p>
              <p className="text-2xl font-bold">{analyticsData.careMetrics.appointmentsAttended}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wellness Score</p>
              <p className="text-2xl font-bold">{analyticsData.careMetrics.wellnessScore}/100</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Activities Participation</p>
              <p className="text-2xl font-bold">{analyticsData.careMetrics.activitiesParticipation}%</p>
            </div>
          </div>
        </Card>

        {/* Family Engagement */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Family Engagement</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold">{analyticsData.familyEngagement.activeMembers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Document Shares</p>
              <p className="text-2xl font-bold">{analyticsData.familyEngagement.documentShares}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Decision Participation</p>
              <p className="text-2xl font-bold">{analyticsData.familyEngagement.decisionParticipation}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Feedback Submitted</p>
              <p className="text-2xl font-bold">{analyticsData.familyEngagement.feedbackSubmitted}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Trends and Insights</h3>
          {/* Add charts/graphs here */}
          <div className="h-[300px] flex items-center justify-center border rounded-lg">
            <p className="text-muted-foreground">Visualization charts will be displayed here</p>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold">Increase Visit Frequency</h4>
              <p className="text-sm text-muted-foreground">
                Consider scheduling more regular visits to maintain strong connections
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold">Document Updates</h4>
              <p className="text-sm text-muted-foreground">
                Some important documents need review and updates
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold">Wellness Activities</h4>
              <p className="text-sm text-muted-foreground">
                Encourage participation in more wellness activities
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


