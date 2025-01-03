/**
 * @writecarenotes.com
 * @fileoverview Domiciliary care visits page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main visits management page for domiciliary care module.
 * Displays scheduled visits, allows filtering and management.
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { 
  Card,
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card/Card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/Tabs/Tabs';
import { Button } from '@/components/ui/Button/Button';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge/Badge';
import { Calendar } from '@/components/ui/Calendar';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'Visits | Domiciliary Care',
  description: 'Manage domiciliary care visits and schedules',
};

export default function VisitsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visits</h1>
          <p className="text-muted-foreground">
            Manage and track domiciliary care visits
          </p>
        </div>
        
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          New Visit
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            <Badge variant="secondary" className="ml-2">12</Badge>
          </TabsTrigger>
          <TabsTrigger value="today">
            Today
            <Badge variant="secondary" className="ml-2">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="secondary" className="ml-2">28</Badge>
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Calendar Card */}
          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>View and manage visit schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="range" className="rounded-md border" />
            </CardContent>
          </Card>

          {/* Visits List */}
          <Card className="col-span-full lg:col-span-4">
            <CardHeader className="space-y-1">
              <CardTitle>Scheduled Visits</CardTitle>
              <CardDescription>
                View and manage upcoming care visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-48" />}>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-4">
                    {/* Visit Items */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">
                                John Smith
                                <Badge variant="outline" className="ml-2">
                                  Morning Care
                                </Badge>
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                9:00 AM - 10:00 AM
                              </p>
                              <p className="text-sm">
                                123 Care Street, London
                              </p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Icons.moreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            <Badge variant="secondary">
                              <Icons.user className="mr-1 h-3 w-3" />
                              Sarah Jones
                            </Badge>
                            <Badge variant="outline">
                              <Icons.clock className="mr-1 h-3 w-3" />
                              60 mins
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
} 
