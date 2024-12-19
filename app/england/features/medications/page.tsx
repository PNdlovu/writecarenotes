'use client';

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const medications = [
  {
    id: "MED001",
    residentName: "John Smith",
    medication: "Amlodipine",
    dosage: "5mg",
    frequency: "Once daily",
    timeOfDay: "Morning",
    status: "Active",
    nextDue: "2023-12-16 08:00",
    prescriber: "Dr. Michael Brown",
    notes: "Take with food",
    alerts: ["Interaction with other medication"],
  },
  {
    id: "MED002",
    residentName: "Mary Johnson",
    medication: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    timeOfDay: "Morning/Evening",
    status: "Active",
    nextDue: "2023-12-16 08:00",
    prescriber: "Dr. Sarah Wilson",
    notes: "Monitor blood sugar",
    alerts: [],
  },
  {
    id: "MED003",
    residentName: "Robert Wilson",
    medication: "Simvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    timeOfDay: "Evening",
    status: "Discontinued",
    nextDue: null,
    prescriber: "Dr. Michael Brown",
    notes: "Discontinued due to side effects",
    alerts: ["Discontinued medication"],
  },
  {
    id: "MED004",
    residentName: "Patricia Brown",
    medication: "Omeprazole",
    dosage: "40mg",
    frequency: "Once daily",
    timeOfDay: "Morning",
    status: "Active",
    nextDue: "2023-12-16 08:00",
    prescriber: "Dr. Sarah Wilson",
    notes: "Take before breakfast",
    alerts: [],
  },
];

export default function MedicationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Medications</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medications..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resident</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Alerts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>{med.residentName}</TableCell>
                <TableCell>
                  <div>
                    <div>{med.medication}</div>
                    <div className="text-sm text-muted-foreground">{med.notes}</div>
                  </div>
                </TableCell>
                <TableCell>{med.dosage}</TableCell>
                <TableCell>
                  <div>
                    <div>{med.frequency}</div>
                    <div className="text-sm text-muted-foreground">{med.timeOfDay}</div>
                  </div>
                </TableCell>
                <TableCell>{med.nextDue || 'N/A'}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${med.status === 'Active' ? 'bg-green-100 text-green-700' : 
                    'bg-red-100 text-red-700'}`}>
                    {med.status}
                  </div>
                </TableCell>
                <TableCell>
                  {med.alerts.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <ul className="list-disc pl-4">
                            {med.alerts.map((alert, index) => (
                              <li key={index}>{alert}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
