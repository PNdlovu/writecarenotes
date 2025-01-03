/**
 * @writecarenotes.com
 * @fileoverview Residents dashboard page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main residents dashboard page displaying resident statistics,
 * actions and resident list with filtering capabilities.
 */

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card/Card';
import { ResidentList } from '@/features/residents/components/ResidentList/resident-list';
import { ResidentStats } from '@/features/residents/components/ResidentStats';
import { ResidentActions } from '@/features/residents/components/ResidentActions';

export default async function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Residents</h1>
        <ResidentActions />
      </div>

      <ResidentStats />

      <Card>
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Residents</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="discharged">Discharged</TabsTrigger>
            <TabsTrigger value="temporary">Temporary</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ResidentList />
          </TabsContent>
          <TabsContent value="active">
            <ResidentList status="active" />
          </TabsContent>
          <TabsContent value="discharged">
            <ResidentList status="discharged" />
          </TabsContent>
          <TabsContent value="temporary">
            <ResidentList status="temporary" />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 