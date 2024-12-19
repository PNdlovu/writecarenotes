'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  MessageSquare, 
  Heart, 
  Activity, 
  FileText, 
  Camera,
  Phone,
  Clock,
  AlertCircle
} from "lucide-react";

const updates = [
  {
    id: "UPD001",
    type: "Activity",
    resident: "Alice Johnson",
    timestamp: "2024-12-15 15:30",
    content: "Participated in afternoon music therapy session. Showed great enthusiasm and engagement.",
    mood: "Happy",
    staff: "Emma Thompson"
  },
  {
    id: "UPD002",
    type: "Health",
    resident: "Alice Johnson",
    timestamp: "2024-12-15 12:00",
    content: "Medication administered as scheduled. Vital signs normal.",
    mood: "Calm",
    staff: "Dr. Sarah Wilson"
  },
  {
    id: "UPD003",
    type: "Social",
    resident: "Alice Johnson",
    timestamp: "2024-12-15 10:15",
    content: "Enjoyed breakfast with other residents. Had a lovely conversation about gardening.",
    mood: "Content",
    staff: "Michael Brown"
  }
];

const appointments = [
  {
    id: "APT001",
    type: "Medical Check-up",
    date: "2024-12-16",
    time: "09:30",
    with: "Dr. Roberts",
    location: "Medical Room",
    status: "Scheduled"
  },
  {
    id: "APT002",
    type: "Family Visit",
    date: "2024-12-17",
    time: "14:00",
    with: "Johnson Family",
    location: "Visitor's Lounge",
    status: "Confirmed"
  },
  {
    id: "APT003",
    type: "Physical Therapy",
    date: "2024-12-18",
    time: "11:00",
    with: "PT Sarah",
    location: "Therapy Room",
    status: "Pending"
  }
];

const documents = [
  {
    id: "DOC001",
    title: "Monthly Care Summary",
    date: "2024-12-01",
    type: "Report",
    status: "New"
  },
  {
    id: "DOC002",
    title: "Activity Participation Log",
    date: "2024-12-10",
    type: "Log",
    status: "Read"
  },
  {
    id: "DOC003",
    title: "Medical Update",
    date: "2024-12-14",
    type: "Medical",
    status: "New"
  }
];

export default function FamilyPortalPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Family Portal</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Photo Gallery
          </Button>
          <Button>
            <Phone className="mr-2 h-4 w-4" />
            Request Call
          </Button>
        </div>
      </div>

      <Tabs defaultValue="updates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="updates">Daily Updates</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4">
          <div className="grid gap-4">
            {updates.map((update) => (
              <Card key={update.id} className="hover:bg-muted/50">
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      {update.type === 'Activity' && <Activity className="mr-2 h-5 w-5 text-blue-500" />}
                      {update.type === 'Health' && <Heart className="mr-2 h-5 w-5 text-red-500" />}
                      {update.type === 'Social' && <MessageSquare className="mr-2 h-5 w-5 text-green-500" />}
                      {update.resident}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {update.timestamp}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <p className="text-sm">{update.content}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Mood: {update.mood}</span>
                      <span>Staff: {update.staff}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4">
            {appointments.map((apt) => (
              <Card key={apt.id} className="hover:bg-muted/50">
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle>{apt.type}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {apt.date} at {apt.time}
                    </CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${apt.status === 'Scheduled' ? 'bg-green-100 text-green-700' : 
                    apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-blue-100 text-blue-700'}`}>
                    {apt.status}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div>With: {apt.with}</div>
                    <div>Location: {apt.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:bg-muted/50">
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      {doc.title}
                    </CardTitle>
                    <CardDescription>{doc.date}</CardDescription>
                  </div>
                  {doc.status === 'New' && (
                    <div className="justify-self-end rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      New
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{doc.type}</span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div>Care Home Emergency: +44 20 1234 5678</div>
            <div>Primary Contact: Dr. Sarah Wilson (Head Nurse)</div>
            <div>Available 24/7 for urgent matters</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
