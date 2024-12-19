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
import { Search, PlusCircle, Stethoscope, FileText, User2, Calendar } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const clinicalRecords = [
  {
    id: "CR001",
    residentName: "John Smith",
    type: "Vital Signs",
    date: "2023-12-15",
    time: "09:30",
    recordedBy: "Sarah Wilson RN",
    details: {
      bp: "120/80",
      pulse: "72",
      temp: "36.8",
      spo2: "98%",
    },
    notes: "All vital signs within normal range",
    priority: "Routine",
  },
  {
    id: "CR002",
    residentName: "Mary Johnson",
    type: "Assessment",
    date: "2023-12-15",
    time: "10:15",
    recordedBy: "Dr. Michael Brown",
    details: {
      complaint: "Chest pain",
      assessment: "Referred to hospital",
      followUp: "Immediate",
    },
    notes: "Emergency assessment conducted",
    priority: "High",
  },
  {
    id: "CR003",
    residentName: "Robert Wilson",
    type: "Medication Review",
    date: "2023-12-14",
    time: "14:00",
    recordedBy: "Dr. Sarah Wilson",
    details: {
      medications: "Reviewed and updated",
      changes: "Dosage adjustment",
      nextReview: "2024-01-14",
    },
    notes: "Monthly medication review completed",
    priority: "Routine",
  },
  {
    id: "CR004",
    residentName: "Patricia Brown",
    type: "Wound Care",
    date: "2023-12-15",
    time: "11:45",
    recordedBy: "Emma Thompson RN",
    details: {
      location: "Left heel",
      stage: "Stage 2",
      treatment: "Dressing changed",
      nextDressing: "2023-12-17",
    },
    notes: "Wound showing signs of improvement",
    priority: "Medium",
  },
];

export default function ClinicalPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Clinical Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="medications">Medication Reviews</TabsTrigger>
            <TabsTrigger value="wounds">Wound Care</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <div className="relative w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search records..." className="pl-8" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </div>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clinicalRecords.map((record) => (
              <Card key={record.id} className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle>{record.residentName}</CardTitle>
                    <CardDescription>{record.type}</CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${record.priority === 'Routine' ? 'bg-green-100 text-green-700' : 
                    record.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}`}>
                    {record.priority}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                      {record.date} {record.time}
                    </div>
                    <div className="flex items-center text-sm">
                      <User2 className="mr-1 h-4 w-4 text-muted-foreground" />
                      {record.recordedBy}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {record.notes}
                    </div>
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
