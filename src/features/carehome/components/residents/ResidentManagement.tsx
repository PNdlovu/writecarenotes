// src/features/carehome/components/residents/ResidentManagement.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useResidentWellbeing } from '../../hooks/useResidentWellbeing';
import { useResidentManagement } from '../../hooks/useResidentManagement';
import { ResidentStatus, MobilityLevel, DietaryRequirement, SocialPreference } from '../../types/resident';
import { CareLevel } from '../../types/care';
import { LoadingState } from '../shared/LoadingState';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ResidentManagementProps {
  careHomeId: string;
}

export function ResidentManagement({ careHomeId }: ResidentManagementProps) {
  const {
    residents,
    filteredResidents,
    selectedResident,
    isLoading,
    error,
    setStatusFilter,
    setSearchQuery,
    selectResident,
    admitResident,
    updateResident,
    dischargeResident,
  } = useResidentManagement(careHomeId);

  const {
    wellbeingData,
    activities,
    wellbeingScore,
    wellbeingAlerts,
    activityRecommendations,
    recordMood,
    recordActivity,
    isLoading: isWellbeingLoading
  } = useResidentWellbeing(selectedResident?.id);

  if (isLoading || isWellbeingLoading) {
    return <LoadingState message="Loading resident data..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-4 bg-red-50">
          <p className="text-red-600">Error loading residents: {error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resident Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Resident</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resident</DialogTitle>
            </DialogHeader>
            {/* Add New Resident Form will go here */}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search residents..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select onValueChange={(value) => setStatusFilter(value as ResidentStatus | 'ALL')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(ResidentStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Care Level</TableHead>
                <TableHead>Mobility</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell>{resident.firstName} {resident.lastName}</TableCell>
                  <TableCell>{resident.room?.number}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{resident.status}</Badge>
                  </TableCell>
                  <TableCell>{resident.careLevel}</TableCell>
                  <TableCell>{resident.mobilityLevel}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => selectResident(resident.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
          <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Resident Overview</h2>
            {selectedResident ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Care Level</h3>
                  <p className="mt-1">{selectedResident.careLevel}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mobility</h3>
                  <p className="mt-1">{selectedResident.mobilityLevel}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dietary Requirements</h3>
                  <p className="mt-1">{selectedResident.dietaryRequirements.join(', ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Social Preferences</h3>
                  <p className="mt-1">{selectedResident.socialPreferences}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Room</h3>
                  <p className="mt-1">{selectedResident.room?.number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">{selectedResident.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a resident to view details</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="wellbeing">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Wellbeing Status</h2>
            {selectedResident && wellbeingScore ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Overall Score</h3>
                    <p className="text-2xl font-bold mt-1">{wellbeingScore.overall}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Trend</h3>
                    <p className="text-2xl font-bold mt-1">{wellbeingScore.trend}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Alerts</h3>
                    <p className="text-2xl font-bold mt-1">{wellbeingAlerts?.length || 0}</p>
                  </Card>
                </div>
                {wellbeingAlerts && wellbeingAlerts.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Alerts</h3>
                    <div className="space-y-2">
                      {wellbeingAlerts.map((alert, index) => (
                        <Card key={index} className="p-3 bg-red-50">
                          <p className="text-red-600">{alert.message}</p>
                          <p className="text-sm text-gray-500">{alert.date}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Select a resident to view wellbeing status</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="care-plan">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Care Plan</h2>
            {selectedResident ? (
              <div className="space-y-4">
                {/* Care plan content */}
                <p className="text-gray-500">Care plan details will be displayed here</p>
              </div>
            ) : (
              <p className="text-gray-500">Select a resident to view care plan</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Activities</h2>
            {selectedResident && activities ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Activities</h3>
                    <ScrollArea className="h-[200px]">
                      {activities.map((activity, index) => (
                        <div key={index} className="p-2 border-b">
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-gray-500">{activity.date}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
                    <ScrollArea className="h-[200px]">
                      {activityRecommendations?.map((recommendation, index) => (
                        <div key={index} className="p-2 border-b">
                          <p className="font-medium">{recommendation.activity}</p>
                          <p className="text-sm text-gray-500">{recommendation.reason}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a resident to view activities</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
