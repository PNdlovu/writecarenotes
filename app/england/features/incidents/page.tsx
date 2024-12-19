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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle, AlertTriangle, Calendar, User2, FileText } from "lucide-react";

const incidents = [
  {
    id: "INC001",
    title: "Fall Incident",
    type: "Fall",
    severity: "High",
    status: "Under Investigation",
    resident: "John Smith",
    location: "Bedroom",
    dateTime: "2023-12-15 08:30",
    reportedBy: "Sarah Wilson RN",
    witnesses: ["Emma Thompson", "David Clark"],
    description: "Resident found on floor beside bed",
    immediateActions: [
      "First aid provided",
      "Doctor notified",
      "Family informed"
    ],
    followUp: "Physiotherapy assessment scheduled"
  },
  {
    id: "INC002",
    title: "Medication Error",
    type: "Medication",
    severity: "Medium",
    status: "Resolved",
    resident: "Mary Johnson",
    location: "Medicine Room",
    dateTime: "2023-12-14 15:45",
    reportedBy: "Lisa Anderson",
    witnesses: ["Michael Brown"],
    description: "Wrong time of medication administration",
    immediateActions: [
      "Doctor consulted",
      "Vital signs monitored",
      "Incident documented"
    ],
    followUp: "Staff retraining scheduled"
  },
  {
    id: "INC003",
    title: "Behavioral Incident",
    type: "Behavioral",
    severity: "Medium",
    status: "Open",
    resident: "Robert Wilson",
    location: "Common Room",
    dateTime: "2023-12-15 14:20",
    reportedBy: "Emma Thompson RN",
    witnesses: ["Sarah Wilson"],
    description: "Agitated behavior towards another resident",
    immediateActions: [
      "Residents separated",
      "De-escalation techniques used",
      "Mental health team notified"
    ],
    followUp: "Care plan review scheduled"
  },
  {
    id: "INC004",
    title: "Property Damage",
    type: "Property",
    severity: "Low",
    status: "Closed",
    resident: "Patricia Brown",
    location: "Dining Room",
    dateTime: "2023-12-13 12:15",
    reportedBy: "David Clark",
    witnesses: [],
    description: "Accidental damage to dining room chair",
    immediateActions: [
      "Area made safe",
      "Alternative seating provided"
    ],
    followUp: "Maintenance completed repairs"
  }
];

const incidentTypes = [
  { value: "all", label: "All Types" },
  { value: "fall", label: "Falls" },
  { value: "medication", label: "Medication Errors" },
  { value: "behavioral", label: "Behavioral Incidents" },
  { value: "property", label: "Property Damage" },
  { value: "security", label: "Security Incidents" }
];

export default function IncidentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Incidents</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search incidents..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {incidentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {incidents.map((incident) => (
          <Card key={incident.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  {incident.title}
                </CardTitle>
                <CardDescription>{incident.type}</CardDescription>
              </div>
              <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                ${incident.severity === 'Low' ? 'bg-green-100 text-green-700' : 
                incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'}`}>
                {incident.severity}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center text-sm">
                  <User2 className="mr-1 h-4 w-4 text-muted-foreground" />
                  Resident: {incident.resident}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  {incident.dateTime}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Location:</span> {incident.location}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={
                    incident.status === 'Resolved' ? 'text-green-600' :
                    incident.status === 'Closed' ? 'text-gray-600' :
                    'text-yellow-600'
                  }>
                    {incident.status}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-muted-foreground">{incident.description}</p>
                </div>
                {incident.immediateActions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium">Immediate Actions:</div>
                    <ul className="ml-5 mt-1 list-disc text-sm text-muted-foreground">
                      {incident.immediateActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {incident.followUp && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Follow-up:</span>
                    <p className="text-muted-foreground">{incident.followUp}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
