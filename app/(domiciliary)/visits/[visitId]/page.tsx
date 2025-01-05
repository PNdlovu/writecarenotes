/**
 * @writecarenotes.com
 * @fileoverview Domiciliary care visit details page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Detailed view of a domiciliary care visit, including client info,
 * care tasks, notes, and visit status management.
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { 
  Card,
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/Tabs/Tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Separator } from '@/components/ui/Separator';

interface PageProps {
  params: {
    visitId: string;
  };
}

export const metadata: Metadata = {
  title: 'Visit Details | Domiciliary Care',
  description: 'View and manage domiciliary care visit details',
};

export default function VisitDetailsPage({ params }: PageProps) {
  // TODO: Fetch visit details
  const visit = {
    id: params.visitId,
    client: {
      name: 'John Smith',
      image: null,
      address: '123 Care Street, London',
      phone: '+44 123 456 7890',
    },
    carer: {
      name: 'Sarah Jones',
      image: null,
      phone: '+44 123 456 7891',
    },
    date: '2024-03-21',
    time: '9:00 AM - 10:00 AM',
    status: 'scheduled',
    type: 'Morning Care',
    duration: 60,
  };

  if (!visit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Icons.arrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Visit Details</h1>
            <p className="text-muted-foreground">
              {visit.date} • {visit.time}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Icons.moreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Icons.edit className="mr-2 h-4 w-4" />
              Edit Visit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.copy className="mr-2 h-4 w-4" />
              Duplicate Visit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Icons.trash className="mr-2 h-4 w-4" />
              Cancel Visit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar
                src={visit.client.image}
                alt={visit.client.name}
                size="lg"
              />
              <div>
                <h3 className="font-semibold">{visit.client.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {visit.client.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {visit.client.phone}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Icons.user className="mr-2 h-4 w-4" />
              View Client Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Carer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Carer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar
                src={visit.carer.image}
                alt={visit.carer.name}
                size="lg"
              />
              <div>
                <h3 className="font-semibold">{visit.carer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {visit.carer.phone}
                </p>
                <div className="mt-2">
                  <Badge variant="outline">
                    <Icons.clock className="mr-1 h-3 w-3" />
                    {visit.duration} mins
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Icons.phone className="mr-2 h-4 w-4" />
              Contact Carer
            </Button>
          </CardFooter>
        </Card>

        {/* Visit Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tasks">
              <TabsList>
                <TabsTrigger value="tasks">Care Tasks</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <TabsContent value="tasks">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {/* Example tasks */}
                      {['Personal Care', 'Medication', 'Meal Preparation'].map((task, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icons.checkSquare className="h-4 w-4" />
                                <span>{task}</span>
                              </div>
                              <Badge variant="outline">Required</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="notes">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        No notes added yet.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="history">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        No visit history available.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 