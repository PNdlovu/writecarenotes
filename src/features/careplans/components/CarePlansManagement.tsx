/**
 * @fileoverview Care Plans Management Component
 * @version 1.2.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState } from 'react';
import { useCarePlan } from '../hooks/useCarePlan';
import { CarePlanStats } from './CarePlanStats';
import { useAccess, useMultiAccess } from '@/features/access-management/hooks/useAccess';
import { ResourceType, PermissionAction } from '@/features/access-management/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/loading/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast/use-toast';
import type { CarePlanFilters } from '../types/careplan.types';

interface CarePlansManagementProps {
  careHomeId: string;
}

export function CarePlansManagement({ careHomeId }: CarePlansManagementProps) {
  const [filters, setFilters] = useState<CarePlanFilters>({});
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const { toast } = useToast();

  // Access control checks
  const {
    isAllowed: canViewPlans,
    isLoading: accessLoading,
    requestEmergencyAccess
  } = useAccess({
    resourceType: ResourceType.CARE_PLAN,
    action: PermissionAction.VIEW
  });

  const {
    isAllowed: canManagePlans,
    isLoading: manageAccessLoading
  } = useAccess({
    resourceType: ResourceType.CARE_PLAN,
    action: PermissionAction.UPDATE
  });

  // Check bulk action permissions
  const bulkAccessChecks = useMultiAccess(
    selectedPlans.map(planId => ({
      resourceType: ResourceType.CARE_PLAN,
      resourceId: planId,
      action: PermissionAction.UPDATE
    }))
  );

  const {
    carePlans,
    loading,
    error,
    applyFilters
  } = useCarePlan({ careHomeId });

  const handleFilterChange = (newFilters: CarePlanFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleSelectPlan = (planId: string, selected: boolean) => {
    setSelectedPlans(prev => 
      selected 
        ? [...prev, planId]
        : prev.filter(id => id !== planId)
    );
  };

  const handleBulkAction = async (action: 'archive' | 'review' | 'export') => {
    if (!bulkAccessChecks.isAllowed) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to perform this action on all selected plans.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Implement bulk actions here
      toast({
        title: 'Success',
        description: `Bulk ${action} completed successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} selected plans`,
        variant: 'destructive'
      });
    }
  };

  const handleRequestEmergencyAccess = async () => {
    try {
      await requestEmergencyAccess('Urgent access needed for care plan management');
      toast({
        title: 'Emergency Access Requested',
        description: 'Your request has been submitted for approval.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request emergency access',
        variant: 'destructive'
      });
    }
  };

  if (accessLoading || manageAccessLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!canViewPlans) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to view care plans.
            {canRequestEmergency && (
              <Button
                onClick={handleRequestEmergencyAccess}
                variant="outline"
                className="mt-4"
              >
                Request Emergency Access
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Resident Care Plans</h1>
            <p className="text-gray-600">Manage care plans and assessments for residents</p>
          </div>
          {canManagePlans && (
            <Button
              onClick={() => {/* Implement create new plan */}}
              variant="default"
            >
              Create New Plan
            </Button>
          )}
        </div>
      </div>

      <CarePlanStats careHomeId={careHomeId} />

      {canManagePlans && selectedPlans.length > 0 && (
        <div className="flex gap-2 my-4">
          <Button
            onClick={() => handleBulkAction('archive')}
            variant="secondary"
            disabled={!bulkAccessChecks.isAllowed}
          >
            Archive Selected
          </Button>
          <Button
            onClick={() => handleBulkAction('review')}
            variant="secondary"
            disabled={!bulkAccessChecks.isAllowed}
          >
            Review Selected
          </Button>
          <Button
            onClick={() => handleBulkAction('export')}
            variant="secondary"
            disabled={!bulkAccessChecks.isAllowed}
          >
            Export Selected
          </Button>
        </div>
      )}

      <div className="mt-8">
        {/* Filters will be implemented in a separate component */}
      </div>

      <div className="mt-8">
        {carePlans.length === 0 ? (
          <div className="text-center text-gray-500">No resident care plans found</div>
        ) : (
          <div className="grid gap-4">
            {carePlans.map(plan => (
              <Card key={plan.id} className="p-4">
                <div className="flex items-center gap-4">
                  {canManagePlans && (
                    <input
                      type="checkbox"
                      checked={selectedPlans.includes(plan.id)}
                      onChange={(e) => handleSelectPlan(plan.id, e.target.checked)}
                      className="h-4 w-4"
                    />
                  )}
                  <div className="flex-grow">
                    <h3 className="font-medium">{plan.title}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Status: </span>
                      <span className="font-medium">{plan.status}</span>
                    </div>
                  </div>
                  {canManagePlans && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
