/**
 * @writecarenotes.com
 * @fileoverview Regional domiciliary care visits page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Region-specific visits page for domiciliary care module, handling
 * visit scheduling, tracking, and compliance with regional requirements.
 */

import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/DataTable';
import { getRegionalConfig } from '@/lib/regional-config';
import { getVisits } from '@/lib/api/visits';
import { formatDate, formatTime } from '@/lib/format';

interface PageProps {
  params: {
    region: string;
  };
}

export default async function VisitsPage({ params }: PageProps) {
  const config = getRegionalConfig(params.region);
  const visits = await getVisits(params.region);

  const columns = [
    {
      accessorKey: 'time',
      header: config.labels.time,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{formatTime(row.original.startTime)}</div>
          <div className="text-sm text-muted-foreground">{formatDate(row.original.date)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'client',
      header: config.labels.client,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.client.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.client.address}</div>
        </div>
      ),
    },
    {
      accessorKey: 'carer',
      header: config.labels.carer,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">{row.original.carer.name}</div>
          {row.original.carer.isQualified && (
            <Badge variant="outline">{config.labels.qualified}</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: config.labels.status,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'completed' ? 'success' : 'default'}>
          {config.labels[row.original.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {config.labels.visits}
          </h1>
          <p className="text-muted-foreground">
            {config.descriptions.visits}
          </p>
        </div>
        <Button>
          {config.labels.newVisit}
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            {config.labels.upcoming}
          </TabsTrigger>
          <TabsTrigger value="today">
            {config.labels.today}
          </TabsTrigger>
          <TabsTrigger value="completed">
            {config.labels.completed}
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <Card className="col-span-1">
              <DataTable
                columns={columns}
                data={visits}
                pageSize={10}
                searchPlaceholder={config.labels.searchVisits}
              />
            </Card>
          </Suspense>

          <Card className="hidden md:block">
            <Calendar
              mode="single"
              className="rounded-md border"
              selected={new Date()}
              onSelect={() => {}}
              disabled={(date) => date < new Date()}
            />
          </Card>
        </div>
      </Tabs>
    </div>
  );
} 