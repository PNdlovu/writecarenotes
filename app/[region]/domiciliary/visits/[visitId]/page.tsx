/**
 * @writecarenotes.com
 * @fileoverview Regional domiciliary care visit details page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Region-specific visit details page for domiciliary care module,
 * handling visit information, tasks, notes, and compliance requirements.
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { getRegionalConfig } from '@/lib/regional-config';
import { getVisitDetails } from '@/lib/api/visits';
import { formatDate, formatTime } from '@/lib/format';

interface PageProps {
  params: {
    region: string;
    visitId: string;
  };
}

export default async function VisitDetailsPage({ params }: PageProps) {
  const config = getRegionalConfig(params.region);
  const visit = await getVisitDetails(params.visitId, params.region);

  if (!visit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {config.labels.visitDetails}
          </h1>
          <p className="text-muted-foreground">
            {formatDate(visit.date)} • {formatTime(visit.startTime)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {config.labels.actions}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              {config.labels.editVisit}
            </DropdownMenuItem>
            <DropdownMenuItem>
              {config.labels.duplicateVisit}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              {config.labels.cancelVisit}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">
            {config.labels.clientInformation}
          </h2>
          <Suspense fallback={<Skeleton className="h-32" />}>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  {config.labels.name}
                </label>
                <p className="font-medium">{visit.client.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  {config.labels.address}
                </label>
                <p className="font-medium">{visit.client.address}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  {config.labels.accessInformation}
                </label>
                <p className="font-medium">{visit.client.accessInfo}</p>
              </div>
            </div>
          </Suspense>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">
            {config.labels.carerInformation}
          </h2>
          <Suspense fallback={<Skeleton className="h-32" />}>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  {config.labels.name}
                </label>
                <p className="font-medium">{visit.carer.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  {config.labels.qualifications}
                </label>
                <div className="flex flex-wrap gap-2">
                  {visit.carer.qualifications.map((qual) => (
                    <Badge key={qual} variant="outline">
                      {qual}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  {config.labels.contact}
                </label>
                <p className="font-medium">{visit.carer.phone}</p>
              </div>
            </div>
          </Suspense>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">
              {config.labels.tasks}
            </TabsTrigger>
            <TabsTrigger value="notes">
              {config.labels.notes}
            </TabsTrigger>
            <TabsTrigger value="history">
              {config.labels.history}
            </TabsTrigger>
          </TabsList>

          <Suspense fallback={<Skeleton className="h-48" />}>
            <TabsContent value="tasks" className="mt-4">
              <div className="space-y-4">
                {visit.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="h-5 w-5 rounded border-gray-300"
                      readOnly
                    />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-4">
                {visit.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(note.timestamp)} • {note.author}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-4">
                {visit.history.map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp)} • {event.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Suspense>
        </Tabs>
      </Card>
    </div>
  );
} 