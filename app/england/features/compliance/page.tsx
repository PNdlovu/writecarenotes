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
  Shield, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  Building2
} from "lucide-react";

const regulations = [
  {
    id: "REG001",
    title: "CQC Registration",
    category: "Registration",
    status: "Compliant",
    lastReview: "2024-11-15",
    nextReview: "2025-11-15",
    assignedTo: "Sarah Wilson",
    documents: ["Registration Certificate", "Annual Return"]
  },
  {
    id: "REG002",
    title: "Health and Safety Policy",
    category: "Health & Safety",
    status: "Review Required",
    lastReview: "2024-06-15",
    nextReview: "2024-12-15",
    assignedTo: "Michael Brown",
    documents: ["Policy Document", "Risk Assessments"]
  },
  {
    id: "REG003",
    title: "Medication Management",
    category: "Clinical",
    status: "Compliant",
    lastReview: "2024-10-01",
    nextReview: "2025-04-01",
    assignedTo: "Dr. Emma Thompson",
    documents: ["Medication Policy", "Audit Reports"]
  }
];

const audits = [
  {
    id: "AUD001",
    title: "Quarterly Care Standards Audit",
    date: "2024-12-01",
    type: "Internal",
    status: "Completed",
    findings: 2,
    assignedTo: "Quality Team",
    actions: ["Update care plan template", "Staff training refresh"]
  },
  {
    id: "AUD002",
    title: "Annual CQC Inspection",
    date: "2024-11-15",
    type: "External",
    status: "Scheduled",
    findings: null,
    assignedTo: "Management Team",
    actions: ["Prepare documentation", "Staff briefing"]
  },
  {
    id: "AUD003",
    title: "Monthly Medication Audit",
    date: "2024-12-10",
    type: "Internal",
    status: "In Progress",
    findings: null,
    assignedTo: "Clinical Lead",
    actions: ["Review MAR charts", "Check storage compliance"]
  }
];

const incidents = [
  {
    id: "INC001",
    title: "Documentation Non-Compliance",
    date: "2024-12-14",
    category: "Documentation",
    severity: "Low",
    status: "Resolved",
    assignedTo: "Sarah Wilson",
    actions: ["Staff training conducted", "New checklist implemented"]
  },
  {
    id: "INC002",
    title: "Medication Storage Issue",
    date: "2024-12-13",
    category: "Medication",
    severity: "Medium",
    status: "In Progress",
    assignedTo: "Clinical Lead",
    actions: ["Immediate corrective action taken", "Review of procedures"]
  }
];

export default function CompliancePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Compliance Management</h2>
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
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 high priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Audit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 Dec</div>
            <p className="text-xs text-muted-foreground">Medication Audit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Due</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Within next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regulations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="incidents">Non-Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="regulations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search regulations..." className="pl-8" />
              </div>
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Review</TableHead>
                  <TableHead>Next Review</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Documents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regulations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.title}</TableCell>
                    <TableCell>{reg.category}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${reg.status === 'Compliant' ? 'bg-green-100 text-green-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                        {reg.status}
                      </div>
                    </TableCell>
                    <TableCell>{reg.lastReview}</TableCell>
                    <TableCell>{reg.nextReview}</TableCell>
                    <TableCell>{reg.assignedTo}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {reg.documents.map((doc, index) => (
                          <Button key={index} variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search audits..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Audit
            </Button>
          </div>

          <div className="grid gap-4">
            {audits.map((audit) => (
              <Card key={audit.id}>
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle>{audit.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{audit.date}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${audit.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                    audit.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                    {audit.status}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Type</div>
                        <div className="text-sm text-muted-foreground">{audit.type}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Assigned To</div>
                        <div className="text-sm text-muted-foreground">{audit.assignedTo}</div>
                      </div>
                    </div>
                    {audit.findings !== null && (
                      <div>
                        <div className="text-sm font-medium">Findings</div>
                        <div className="text-sm text-muted-foreground">{audit.findings} items identified</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">Actions</div>
                      <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                        {audit.actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search incidents..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </div>

          <div className="grid gap-4">
            {incidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                      {incident.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{incident.date}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${incident.severity === 'Low' ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'}`}>
                    {incident.severity}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Category</div>
                        <div className="text-sm text-muted-foreground">{incident.category}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Status</div>
                        <div className={`text-sm ${
                          incident.status === 'Resolved' ? 'text-green-600' : 
                          'text-yellow-600'
                        }`}>
                          {incident.status}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Assigned To</div>
                      <div className="text-sm text-muted-foreground">{incident.assignedTo}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Actions Taken</div>
                      <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                        {incident.actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
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
