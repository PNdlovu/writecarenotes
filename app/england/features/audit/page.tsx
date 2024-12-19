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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  PlusCircle, 
  ClipboardCheck, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const audits = [
  {
    id: "AUD001",
    title: "Quarterly Care Quality Review",
    type: "Internal",
    startDate: "2024-12-01",
    endDate: "2024-12-10",
    status: "Completed",
    lead: "Emma Thompson",
    department: "Clinical Care",
    findings: 3,
    criticalFindings: 0
  },
  {
    id: "AUD002",
    title: "Medication Management Audit",
    type: "External",
    startDate: "2024-12-15",
    endDate: "2024-12-20",
    status: "In Progress",
    lead: "Dr. James Wilson",
    department: "Pharmacy",
    findings: 2,
    criticalFindings: 1
  },
  {
    id: "AUD003",
    title: "Health & Safety Compliance",
    type: "Internal",
    startDate: "2024-12-28",
    endDate: "2024-12-31",
    status: "Scheduled",
    lead: "Sarah Parker",
    department: "Operations",
    findings: 0,
    criticalFindings: 0
  }
];

const findings = [
  {
    id: "FIN001",
    auditId: "AUD001",
    description: "Incomplete care plan documentation",
    severity: "Medium",
    status: "In Progress",
    assignedTo: "Care Team Lead",
    dueDate: "2024-12-25",
    action: "Update documentation process and retrain staff"
  },
  {
    id: "FIN002",
    auditId: "AUD002",
    description: "Medication storage temperature log missing entries",
    severity: "Critical",
    status: "Open",
    assignedTo: "Pharmacy Lead",
    dueDate: "2024-12-18",
    action: "Implement automated temperature monitoring system"
  },
  {
    id: "FIN003",
    auditId: "AUD001",
    description: "Staff training records not up to date",
    severity: "Low",
    status: "Resolved",
    assignedTo: "HR Manager",
    dueDate: "2024-12-20",
    action: "Update training matrix and schedule refresher courses"
  }
];

const actions = [
  {
    id: "ACT001",
    findingId: "FIN001",
    description: "Develop new documentation checklist",
    status: "Completed",
    assignedTo: "Quality Manager",
    completedDate: "2024-12-14",
    evidence: "Updated SOP document"
  },
  {
    id: "ACT002",
    findingId: "FIN002",
    description: "Install temperature monitoring system",
    status: "In Progress",
    assignedTo: "Maintenance Team",
    completedDate: null,
    evidence: "Purchase order submitted"
  },
  {
    id: "ACT003",
    findingId: "FIN003",
    description: "Schedule staff training sessions",
    status: "Completed",
    assignedTo: "Training Coordinator",
    completedDate: "2024-12-13",
    evidence: "Training schedule published"
  }
];

export default function AuditPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audit Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Audit
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Audits</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 internal, 1 external</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">1 critical finding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dec 18</div>
            <p className="text-xs text-muted-foreground">Critical action required</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search audits..." className="pl-8" />
              </div>
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Findings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell>{audit.id}</TableCell>
                    <TableCell>{audit.title}</TableCell>
                    <TableCell>{audit.type}</TableCell>
                    <TableCell>{audit.startDate}</TableCell>
                    <TableCell>{audit.endDate}</TableCell>
                    <TableCell>{audit.lead}</TableCell>
                    <TableCell>{audit.department}</TableCell>
                    <TableCell>
                      <Badge variant={
                        audit.status === 'Completed' ? 'success' :
                        audit.status === 'In Progress' ? 'warning' :
                        'secondary'
                      }>
                        {audit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {audit.findings} ({audit.criticalFindings} critical)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search findings..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Finding
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>{finding.id}</TableCell>
                    <TableCell>{finding.description}</TableCell>
                    <TableCell>
                      <Badge variant={
                        finding.severity === 'Critical' ? 'destructive' :
                        finding.severity === 'Medium' ? 'warning' :
                        'secondary'
                      }>
                        {finding.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        finding.status === 'Resolved' ? 'success' :
                        finding.status === 'In Progress' ? 'warning' :
                        'destructive'
                      }>
                        {finding.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{finding.assignedTo}</TableCell>
                    <TableCell>{finding.dueDate}</TableCell>
                    <TableCell>{finding.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search actions..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Action
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>{action.id}</TableCell>
                    <TableCell>{action.description}</TableCell>
                    <TableCell>
                      <Badge variant={
                        action.status === 'Completed' ? 'success' :
                        'warning'
                      }>
                        {action.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{action.assignedTo}</TableCell>
                    <TableCell>{action.completedDate || 'Pending'}</TableCell>
                    <TableCell>{action.evidence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
