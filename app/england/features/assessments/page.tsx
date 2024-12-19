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
import { Search, PlusCircle, ClipboardCheck, Calendar, User2, FileText } from "lucide-react";

const assessments = [
  {
    id: "ASS001",
    residentName: "John Smith",
    type: "Initial Assessment",
    category: "Care Needs",
    status: "Completed",
    completedBy: "Sarah Wilson RN",
    completedDate: "2023-12-01",
    nextDue: "2024-03-01",
    score: "42/50",
    recommendations: [
      "Regular mobility assistance",
      "Dietary modifications needed",
      "Social activity participation encouraged"
    ]
  },
  {
    id: "ASS002",
    residentName: "Mary Johnson",
    type: "Monthly Review",
    category: "Mental Health",
    status: "Pending Review",
    completedBy: "Dr. Michael Brown",
    completedDate: "2023-12-14",
    nextDue: "2024-01-14",
    score: "38/50",
    recommendations: [
      "Continue current medication regime",
      "Increase social interactions",
      "Weekly counseling sessions"
    ]
  },
  {
    id: "ASS003",
    residentName: "Robert Wilson",
    type: "Quarterly Assessment",
    category: "Physical Health",
    status: "In Progress",
    completedBy: "Emma Thompson RN",
    completedDate: null,
    nextDue: "2023-12-20",
    score: null,
    recommendations: []
  },
  {
    id: "ASS004",
    residentName: "Patricia Brown",
    type: "Risk Assessment",
    category: "Falls Risk",
    status: "Action Required",
    completedBy: "Lisa Anderson",
    completedDate: "2023-12-10",
    nextDue: "2023-12-17",
    score: "High Risk",
    recommendations: [
      "Install bed rails",
      "Physiotherapy referral",
      "Regular supervision during mobility"
    ]
  }
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "care-needs", label: "Care Needs" },
  { value: "mental-health", label: "Mental Health" },
  { value: "physical-health", label: "Physical Health" },
  { value: "falls-risk", label: "Falls Risk" },
  { value: "nutrition", label: "Nutrition" },
  { value: "social", label: "Social & Activities" }
];

export default function AssessmentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assessments..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle>{assessment.residentName}</CardTitle>
                <CardDescription>{assessment.type}</CardDescription>
              </div>
              <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                ${assessment.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                assessment.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' : 
                assessment.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'}`}>
                {assessment.status}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center text-sm">
                  <ClipboardCheck className="mr-1 h-4 w-4 text-muted-foreground" />
                  Category: {assessment.category}
                </div>
                {assessment.completedDate && (
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                    Completed: {assessment.completedDate}
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  Next Due: {assessment.nextDue}
                </div>
                {assessment.completedBy && (
                  <div className="flex items-center text-sm">
                    <User2 className="mr-1 h-4 w-4 text-muted-foreground" />
                    {assessment.completedBy}
                  </div>
                )}
                {assessment.score && (
                  <div className="flex items-center text-sm font-medium">
                    Score: {assessment.score}
                  </div>
                )}
                {assessment.recommendations.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium">Recommendations:</div>
                    <ul className="ml-5 mt-1 list-disc text-sm text-muted-foreground">
                      {assessment.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
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
