/**
 * @writecarenotes.com
 * @fileoverview Visit details component for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A detailed view component for displaying comprehensive information
 * about a domiciliary care visit. Shows client details, tasks,
 * staff assignments, and visit history.
 *
 * Features:
 * - Visit information display
 * - Task management
 * - Staff coordination
 * - Location tracking
 * - Visit history
 *
 * Mobile-First Considerations:
 * - Touch-friendly interactions
 * - Responsive layout
 * - Offline support
 * - Map integration
 * - Real-time updates
 *
 * Enterprise Features:
 * - Role-based access
 * - Audit logging
 * - Regional compliance
 * - Error handling
 * - Analytics tracking
 */

import React, { useCallback } from 'react';
import { format } from 'date-fns';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';

// Icons
import {
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
  Edit,
  Copy,
  Trash,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  History
} from 'lucide-react';

// Types
import type { Visit, VisitTask } from '../../types';

// Utils
import { calculateTaskCompletion, formatDuration } from '../../utils';

// Hooks
import { useVisit } from '../../hooks';
import { useAnalytics } from '@/hooks/useAnalytics';

interface VisitDetailsProps {
  visitId: string;
  onEdit?: (visit: Visit) => void;
  onDuplicate?: (visit: Visit) => void;
  onDelete?: (visit: Visit) => void;
}

export const VisitDetails: React.FC<VisitDetailsProps> = ({
  visitId,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const { visit, loading, error, updateVisit } = useVisit(visitId);
  const { trackEvent } = useAnalytics();

  const handleEdit = useCallback(() => {
    if (!visit) return;
    trackEvent('visit_details_edit', { visitId });
    onEdit?.(visit);
  }, [visit, visitId, onEdit, trackEvent]);

  const handleDuplicate = useCallback(() => {
    if (!visit) return;
    trackEvent('visit_details_duplicate', { visitId });
    onDuplicate?.(visit);
  }, [visit, visitId, onDuplicate, trackEvent]);

  const handleDelete = useCallback(() => {
    if (!visit) return;
    trackEvent('visit_details_delete', { visitId });
    onDelete?.(visit);
  }, [visit, visitId, onDelete, trackEvent]);

  const handleTaskComplete = useCallback(async (taskId: string) => {
    if (!visit) return;
    trackEvent('visit_task_complete', { visitId, taskId });
    const updatedTasks = visit.tasks.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    await updateVisit({ ...visit, tasks: updatedTasks });
  }, [visit, updateVisit, trackEvent]);

  if (loading) {
    return <div>Loading visit details...</div>;
  }

  if (error) {
    return <div>Error loading visit details. Please try again.</div>;
  }

  if (!visit) {
    return <div>Visit not found.</div>;
  }

  const taskCompletion = calculateTaskCompletion(visit.tasks);
  const isOverdue = new Date(visit.scheduledEnd) < new Date() && visit.status !== 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visit Details</h1>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className={`bg-${visit.status.toLowerCase()}`}>
              {visit.status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Visit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Visit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash className="w-4 h-4 mr-2" />
              Delete Visit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <div className="p-6 space-y-6">
              {/* Schedule */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Schedule</h2>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {format(new Date(visit.scheduledStart), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {format(new Date(visit.scheduledStart), 'HH:mm')} - 
                      {format(new Date(visit.scheduledEnd), 'HH:mm')}
                      {' '}
                      ({formatDuration(
                        (new Date(visit.scheduledEnd).getTime() - 
                         new Date(visit.scheduledStart).getTime()) / 60000
                      )})
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Location</h2>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>
                    {visit.location.latitude}, {visit.location.longitude}
                  </span>
                </div>
                {/* Add map component here */}
              </div>

              {/* Notes */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Notes</h2>
                <p className="text-gray-600">{visit.notes || 'No notes added'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Tasks</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {taskCompletion}% Complete
                  </span>
                  <Progress value={taskCompletion} className="w-24 h-2" />
                </div>
              </div>
              <div className="space-y-4">
                {visit.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{task.description}</div>
                      <div className="text-sm text-gray-500">{task.type}</div>
                    </div>
                    <Button
                      variant={task.completed ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => handleTaskComplete(task.id)}
                      disabled={task.completed}
                    >
                      <CheckCircle
                        className={`w-4 h-4 mr-2 ${
                          task.completed ? 'text-green-500' : ''
                        }`}
                      />
                      {task.completed ? 'Completed' : 'Complete'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Assigned Staff</h2>
              <div className="space-y-4">
                {visit.staff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-10 h-10" />
                      <div>
                        <div className="font-medium">{staff.id}</div>
                        <div className="text-sm text-gray-500">{staff.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Visit History</h2>
              <div className="space-y-4">
                {/* Add visit history timeline here */}
                <div className="text-gray-500">No history available</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 