'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Bed as BedIcon, User2, Calendar } from "lucide-react";

const beds = [
  {
    id: "B101",
    roomNumber: "101",
    wing: "Main Wing",
    type: "Standard",
    status: "Occupied",
    resident: "John Smith",
    admissionDate: "2023-01-15",
    notes: "Near nursing station",
  },
  {
    id: "B102",
    roomNumber: "102",
    wing: "Main Wing",
    type: "Standard",
    status: "Available",
    resident: null,
    admissionDate: null,
    notes: "Window view",
  },
  {
    id: "B103",
    roomNumber: "103",
    wing: "Memory Care",
    type: "Memory Care",
    status: "Occupied",
    resident: "Robert Wilson",
    admissionDate: "2023-03-10",
    notes: "Specialized care bed",
  },
  {
    id: "B104",
    roomNumber: "104",
    wing: "Main Wing",
    type: "Premium",
    status: "Reserved",
    resident: "Incoming: Mary Thompson",
    admissionDate: "2024-01-01",
    notes: "En-suite bathroom",
  },
  {
    id: "B105",
    roomNumber: "105",
    wing: "Memory Care",
    type: "Memory Care",
    status: "Maintenance",
    resident: null,
    admissionDate: null,
    notes: "Under renovation",
  },
  {
    id: "B201",
    roomNumber: "201",
    wing: "Main Wing",
    type: "Premium",
    status: "Occupied",
    resident: "Patricia Brown",
    admissionDate: "2023-04-20",
    notes: "Garden view",
  },
];

export default function BedManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bed Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Bed
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search beds..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {beds.map((bed) => (
          <Card key={bed.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BedIcon className="mr-2 h-5 w-5" />
                  Room {bed.roomNumber}
                </CardTitle>
                <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${bed.status === 'Occupied' ? 'bg-blue-100 text-blue-700' : 
                  bed.status === 'Available' ? 'bg-green-100 text-green-700' : 
                  bed.status === 'Reserved' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'}`}>
                  {bed.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="text-sm">
                  <span className="font-medium">Wing:</span> {bed.wing}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Type:</span> {bed.type}
                </div>
                {bed.resident && (
                  <>
                    <div className="flex items-center text-sm">
                      <User2 className="mr-1 h-4 w-4 text-muted-foreground" />
                      {bed.resident}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {bed.admissionDate}
                    </div>
                  </>
                )}
                <div className="text-sm text-muted-foreground">
                  {bed.notes}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
