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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  PlusCircle,
  UserPlus,
  Calendar,
  Clock,
  Briefcase,
  Award,
  FileText,
  Mail,
  Phone
} from "lucide-react";

const staffMembers = [
  {
    id: "STF001",
    name: "Sarah Wilson",
    role: "Head Nurse",
    department: "Medical",
    status: "Active",
    shift: "Morning",
    contact: {
      email: "sarah.wilson@sunrisecare.com",
      phone: "+44 7700 900123"
    },
    certifications: ["RGN", "Clinical Leadership"],
    nextShift: "2024-12-16 07:00"
  },
  {
    id: "STF002",
    name: "James Thompson",
    role: "Care Assistant",
    department: "Care",
    status: "Active",
    shift: "Evening",
    contact: {
      email: "james.thompson@sunrisecare.com",
      phone: "+44 7700 900124"
    },
    certifications: ["Care Certificate", "First Aid"],
    nextShift: "2024-12-16 14:00"
  },
  {
    id: "STF003",
    name: "Emma Brown",
    role: "Physiotherapist",
    department: "Therapy",
    status: "On Leave",
    shift: "Day",
    contact: {
      email: "emma.brown@sunrisecare.com",
      phone: "+44 7700 900125"
    },
    certifications: ["HCPC", "Manual Handling"],
    nextShift: "2024-12-18 09:00"
  }
];

const schedules = [
  {
    id: "SCH001",
    staff: "Sarah Wilson",
    date: "2024-12-16",
    shift: "Morning (07:00-15:00)",
    department: "Medical",
    status: "Confirmed"
  },
  {
    id: "SCH002",
    staff: "James Thompson",
    date: "2024-12-16",
    shift: "Evening (14:00-22:00)",
    department: "Care",
    status: "Confirmed"
  },
  {
    id: "SCH003",
    staff: "Emma Brown",
    date: "2024-12-18",
    shift: "Day (09:00-17:00)",
    department: "Therapy",
    status: "Pending"
  }
];

const documents = [
  {
    id: "DOC001",
    title: "Staff Handbook 2024",
    type: "Policy",
    lastUpdated: "2024-12-01",
    status: "Current"
  },
  {
    id: "DOC002",
    title: "Training Records Q4",
    type: "Records",
    lastUpdated: "2024-12-10",
    status: "New"
  },
  {
    id: "DOC003",
    title: "Health & Safety Guidelines",
    type: "Policy",
    lastUpdated: "2024-12-05",
    status: "Current"
  }
];

export default function StaffPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search staff..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staffMembers.map((staff) => (
              <Card key={staff.id} className="hover:bg-muted/50">
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle>{staff.name}</CardTitle>
                    <CardDescription>{staff.role}</CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${staff.status === 'Active' ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'}`}>
                    {staff.status}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center text-sm">
                      <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                      {staff.department}
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {staff.contact.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {staff.contact.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                      {staff.certifications.join(", ")}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      Next Shift: {staff.nextShift}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle>{schedule.staff}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {schedule.date}
                    </CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${schedule.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'}`}>
                    {schedule.status}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Shift:</span>
                      <span>{schedule.shift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <span>{schedule.department}</span>
                    </div>
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
                    <CardDescription>Last updated: {doc.lastUpdated}</CardDescription>
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
    </div>
  );
}
