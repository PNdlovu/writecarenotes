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
import { Search, PlusCircle, MessageSquare, Bell, Clock, User2 } from "lucide-react";

const communications = [
  {
    id: "COM001",
    title: "Staff Meeting Update",
    type: "Announcement",
    sender: "Sarah Wilson",
    timestamp: "2023-12-15 09:00",
    priority: "High",
    status: "Unread",
    recipients: "All Staff",
    message: "Important updates regarding new care protocols and upcoming training sessions."
  },
  {
    id: "COM002",
    title: "Weekend Activities Schedule",
    type: "Notice",
    sender: "Emma Thompson",
    timestamp: "2023-12-15 10:30",
    priority: "Normal",
    status: "Read",
    recipients: "Staff, Residents, Families",
    message: "Schedule for weekend activities and special events."
  },
  {
    id: "COM003",
    title: "Maintenance Notice",
    type: "Alert",
    sender: "David Clark",
    timestamp: "2023-12-15 11:45",
    priority: "Medium",
    status: "Unread",
    recipients: "All Staff",
    message: "Scheduled maintenance in the west wing tomorrow between 14:00-16:00."
  },
  {
    id: "COM004",
    title: "Family Visit Guidelines",
    type: "Policy Update",
    sender: "Lisa Anderson",
    timestamp: "2023-12-15 13:15",
    priority: "High",
    status: "Read",
    recipients: "Staff, Families",
    message: "Updated guidelines for family visits and safety protocols."
  }
];

export default function CommunicationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search communications..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {communications.map((comm) => (
          <Card key={comm.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  {comm.title}
                </CardTitle>
                <CardDescription>{comm.type}</CardDescription>
              </div>
              <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                ${comm.priority === 'High' ? 'bg-red-100 text-red-700' : 
                comm.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'}`}>
                {comm.priority}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center text-sm">
                  <User2 className="mr-1 h-4 w-4 text-muted-foreground" />
                  From: {comm.sender}
                </div>
                <div className="flex items-center text-sm">
                  <Bell className="mr-1 h-4 w-4 text-muted-foreground" />
                  To: {comm.recipients}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                  {comm.timestamp}
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">{comm.message}</p>
                </div>
                <div className="mt-2">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${comm.status === 'Unread' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'}`}>
                    {comm.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
