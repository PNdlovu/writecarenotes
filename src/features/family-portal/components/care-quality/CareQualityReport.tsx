/**
 * @fileoverview Care Quality Report Component
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive care quality reporting and feedback system
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccessibility } from '../../hooks/useAccessibility';
import { useToast } from "@/components/ui/UseToast";

interface CareQualityReportProps {
  residentId: string;
  familyMemberId: string;
}

interface QualityMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  details: string;
}

interface Incident {
  id: string;
  date: Date;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'reported' | 'investigating' | 'resolved';
  resolution?: string;
}

interface Feedback {
  id: string;
  date: Date;
  category: string;
  rating: number;
  comment: string;
  response?: string;
}

export const CareQualityReport: React.FC<CareQualityReportProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { toast } = useToast();
  const { getAriaProps } = useAccessibility();

  // Mock data - replace with actual API calls
  const qualityMetrics: QualityMetric[] = [
    {
      category: 'Personal Care',
      score: 92,
      trend: 'up',
      details: 'Consistent improvement in personal care delivery'
    },
    {
      category: 'Medication Management',
      score: 95,
      trend: 'stable',
      details: 'Maintaining high standards in medication administration'
    },
    {
      category: 'Social Engagement',
      score: 88,
      trend: 'up',
      details: 'Increased participation in social activities'
    }
  ];

  const incidents: Incident[] = [
    {
      id: '1',
      date: new Date(),
      type: 'Minor Fall',
      severity: 'low',
      description: 'Slight stumble during morning walk',
      status: 'resolved',
      resolution: 'Additional support rails installed'
    }
  ];

  const feedback: Feedback[] = [
    {
      id: '1',
      date: new Date(),
      category: 'Staff Care',
      rating: 4,
      comment: 'Very attentive and caring staff',
      response: 'Thank you for your positive feedback'
    }
  ];

  const reportIncident = (data: Omit<Incident, 'id' | 'date' | 'status'>) => {
    // Implement incident reporting logic
    toast({
      title: "Incident Reported",
      description: "The incident has been logged and will be investigated",
    });
    setShowIncidentForm(false);
  };

  const submitFeedback = (data: Omit<Feedback, 'id' | 'date' | 'response'>) => {
    // Implement feedback submission logic
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback",
    });
    setShowFeedbackForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Care Quality Report</h2>
          <p className="text-muted-foreground">
            Monitor and report on care quality metrics
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setShowIncidentForm(true)}>
            Report Incident
          </Button>
          <Button onClick={() => setShowFeedbackForm(true)}>
            Submit Feedback
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quality Metrics */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Quality Metrics</h3>
          <div className="space-y-4">
            {qualityMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{metric.category}</h4>
                    <p className="text-2xl font-bold">{metric.score}%</p>
                  </div>
                  <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metric.details}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Incidents */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Recent Incidents</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{incident.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {incident.date.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      incident.severity === 'high' ? 'destructive' :
                      incident.severity === 'medium' ? 'secondary' :
                      'default'
                    }>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="mt-2">{incident.description}</p>
                  {incident.resolution && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Resolution: {incident.resolution}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {incident.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Feedback */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Recent Feedback</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={
                          i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                        }>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2">{item.comment}</p>
                  {item.response && (
                    <div className="mt-2 bg-muted p-2 rounded-lg">
                      <p className="text-sm">Response: {item.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Incident Report Dialog */}
      <Dialog open={showIncidentForm} onOpenChange={setShowIncidentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Incident</DialogTitle>
            <DialogDescription>
              Report any incidents or concerns
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Incident Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Textarea
                placeholder="Describe the incident"
                className="h-32"
                {...getAriaProps('textbox')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIncidentForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => reportIncident({
              type: '',
              severity: 'low',
              description: ''
            })}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Share your feedback about the care quality
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff Care</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    className="w-10 h-10"
                    {...getAriaProps('button')}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Textarea
                placeholder="Your feedback"
                className="h-32"
                {...getAriaProps('textbox')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => submitFeedback({
              category: '',
              rating: 0,
              comment: ''
            })}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


