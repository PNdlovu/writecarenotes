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
import { PlusCircle, Search, FileText, Clock, UserCheck } from "lucide-react";

const carePlans = [
  {
    id: "CP001",
    residentName: "John Smith",
    type: "Personal Care",
    lastUpdated: "2023-12-10",
    nextReview: "2024-01-10",
    status: "Active",
    assignedTo: "Sarah Wilson",
  },
  {
    id: "CP002",
    residentName: "Mary Johnson",
    type: "Medication Management",
    lastUpdated: "2023-12-12",
    nextReview: "2024-01-12",
    status: "Under Review",
    assignedTo: "Dr. Michael Brown",
  },
  {
    id: "CP003",
    residentName: "Robert Wilson",
    type: "Mobility Support",
    lastUpdated: "2023-12-08",
    nextReview: "2024-01-08",
    status: "Active",
    assignedTo: "Emma Thompson",
  },
  {
    id: "CP004",
    residentName: "Patricia Brown",
    type: "Nutrition Plan",
    lastUpdated: "2023-12-14",
    nextReview: "2024-01-14",
    status: "Needs Update",
    assignedTo: "Lisa Anderson",
  },
];

export default function CarePlansPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Care Plans</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Care Plan
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search care plans..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {carePlans.map((plan) => (
          <Card key={plan.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle>{plan.residentName}</CardTitle>
                <CardDescription>{plan.type}</CardDescription>
              </div>
              <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                ${plan.status === 'Active' ? 'bg-green-100 text-green-700' : 
                plan.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'}`}>
                {plan.status}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Last updated: {plan.lastUpdated}
                </div>
                <div className="flex items-center">
                  <UserCheck className="mr-1 h-4 w-4" />
                  {plan.assignedTo}
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <FileText className="mr-1 h-4 w-4" />
                Next review: {plan.nextReview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
