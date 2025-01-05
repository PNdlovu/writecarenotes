import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import {
  CalendarIcon,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { Assessment, AssessmentStatus } from '../../types/assessment.types';
import { calculateCompletionPercentage } from '../../utils/assessmentHelpers';
import { assessmentApi } from '@/api/assessments/assessmentApi';

export interface AssessmentViewerProps {
  assessment: Assessment;
  onStartAssessment: (id: string) => void;
  onEditAssessment: (id: string) => void;
  onDeleteAssessment: (id: string) => void;
}

export function AssessmentViewer({
  assessment,
  onStartAssessment,
  onEditAssessment,
  onDeleteAssessment,
}: AssessmentViewerProps) {
  const getStatusIcon = (status: AssessmentStatus['status']) => {
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
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{assessment.title}</h2>
          <div className="flex gap-2 items-center mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              {getStatusIcon(assessment.status.status)}
              {assessment.status.status.charAt(0).toUpperCase() +
                assessment.status.status.slice(1)}
            </Badge>
            {assessment.isRecurring && (
              <Badge variant="outline" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Recurring
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditAssessment(assessment.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteAssessment(assessment.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{format(assessment.date, 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {assessment.time} ({assessment.duration} minutes)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{assessment.participants} participants</span>
              </div>
            </div>
          </div>

          {assessment.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {assessment.description}
              </p>
            </div>
          )}

          {assessment.isRecurring && assessment.recurringPattern && (
            <div>
              <h3 className="font-semibold mb-2">Recurring Pattern</h3>
              <p className="text-sm text-muted-foreground">
                Repeats every {assessment.recurringPattern.interval}{' '}
                {assessment.recurringPattern.frequency}
                {assessment.recurringPattern.interval > 1 ? 's' : ''}{' '}
                {assessment.recurringPattern.endDate &&
                  `until ${format(
                    assessment.recurringPattern.endDate,
                    'MMMM d, yyyy'
                  )}`}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {assessment.status.status === 'completed' && (
            <div>
              <h3 className="font-semibold mb-2">Completion Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>
                    Completed on{' '}
                    {assessment.status.completedDate &&
                      format(assessment.status.completedDate, 'MMMM d, yyyy')}
                  </span>
                </div>
                {assessment.status.score !== undefined && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Score: {assessment.status.score}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {assessment.attachments && assessment.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Attachments</h3>
              <ScrollArea className="h-[100px]">
                <div className="space-y-2">
                  {assessment.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attachment.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {assessment.status.status === 'pending' && (
        <div className="mt-6">
          <Separator className="mb-6" />
          <Button
            className="w-full"
            onClick={() => onStartAssessment(assessment.id)}
          >
            Start Assessment
          </Button>
        </div>
      )}
    </Card>
  );
}
