'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Calendar, Users, Trophy } from "lucide-react";

const activities = [
  {
    id: "ACT001",
    title: "Morning Exercise",
    type: "Physical Activity",
    time: "09:00 - 10:00",
    location: "Activity Room",
    capacity: "15",
    enrolled: "12",
    instructor: "Sarah Wilson",
    status: "Scheduled",
    nextSession: "2023-12-16"
  },
  {
    id: "ACT002",
    title: "Art & Craft Workshop",
    type: "Creative",
    time: "14:00 - 15:30",
    location: "Craft Room",
    capacity: "10",
    enrolled: "8",
    instructor: "Emma Thompson",
    status: "In Progress",
    nextSession: "2023-12-16"
  },
  {
    id: "ACT003",
    title: "Music Therapy",
    type: "Therapy",
    time: "11:00 - 12:00",
    location: "Music Room",
    capacity: "12",
    enrolled: "10",
    instructor: "Michael Brown",
    status: "Scheduled",
    nextSession: "2023-12-17"
  },
  {
    id: "ACT004",
    title: "Garden Club",
    type: "Outdoor",
    time: "10:00 - 11:30",
    location: "Garden",
    capacity: "8",
    enrolled: "6",
    instructor: "David Clark",
    status: "Scheduled",
    nextSession: "2023-12-18"
  }
];

export default function ActivitiesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Activities</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activities..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle>{activity.title}</CardTitle>
                <CardDescription>{activity.type}</CardDescription>
              </div>
              <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                ${activity.status === 'Scheduled' ? 'bg-green-100 text-green-700' : 
                activity.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                'bg-yellow-100 text-yellow-700'}`}>
                {activity.status}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  {activity.time}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Location:</span> {activity.location}
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                  {activity.enrolled}/{activity.capacity} Participants
                </div>
                <div className="text-sm">
                  <span className="font-medium">Instructor:</span> {activity.instructor}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Trophy className="mr-1 h-4 w-4" />
                  Next Session: {activity.nextSession}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
