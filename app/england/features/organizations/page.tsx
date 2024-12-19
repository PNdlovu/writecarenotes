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
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Shield,
  Settings,
  PlusCircle,
  FileText,
  Briefcase
} from "lucide-react";

const organizations = [
  {
    id: "ORG001",
    name: "Sunrise Care Group",
    type: "Care Home Provider",
    status: "Active",
    locations: 5,
    totalBeds: 250,
    totalStaff: 150,
    contact: {
      address: "45 Corporate Drive, London, UK",
      phone: "+44 20 7123 4567",
      email: "admin@sunrisecare.com"
    },
    compliance: {
      cqcRating: "Good",
      lastInspection: "2024-11-15",
      nextInspection: "2025-05-15"
    }
  },
  {
    id: "ORG002",
    name: "Golden Years Care",
    type: "Care Home Provider",
    status: "Active",
    locations: 3,
    totalBeds: 150,
    totalStaff: 90,
    contact: {
      address: "78 Care Lane, Manchester, UK",
      phone: "+44 20 7123 4568",
      email: "admin@goldenyears.com"
    },
    compliance: {
      cqcRating: "Outstanding",
      lastInspection: "2024-10-20",
      nextInspection: "2025-04-20"
    }
  }
];

const locations = [
  {
    id: "LOC001",
    name: "Sunrise Care Home - London East",
    organization: "Sunrise Care Group",
    type: "Residential Care",
    beds: 50,
    occupancy: 45,
    staff: 30,
    manager: "Emma Thompson",
    status: "Operational"
  },
  {
    id: "LOC002",
    name: "Sunrise Care Home - London West",
    organization: "Sunrise Care Group",
    type: "Nursing Home",
    beds: 60,
    occupancy: 55,
    staff: 35,
    manager: "James Wilson",
    status: "Operational"
  },
  {
    id: "LOC003",
    name: "Golden Years - Manchester",
    organization: "Golden Years Care",
    type: "Residential Care",
    beds: 45,
    occupancy: 40,
    staff: 28,
    manager: "Sarah Parker",
    status: "Operational"
  }
];

const documents = [
  {
    id: "DOC001",
    title: "Corporate Policies 2024",
    organization: "Sunrise Care Group",
    type: "Policy",
    lastUpdated: "2024-12-01",
    status: "Active"
  },
  {
    id: "DOC002",
    title: "Staff Training Framework",
    organization: "Sunrise Care Group",
    type: "Framework",
    lastUpdated: "2024-12-10",
    status: "Under Review"
  },
  {
    id: "DOC003",
    title: "Quality Assurance Guidelines",
    organization: "Golden Years Care",
    type: "Guidelines",
    lastUpdated: "2024-12-05",
    status: "Active"
  }
];

export default function OrganizationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Organization
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search organizations..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Organizations</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:bg-muted/50">
                <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      {org.name}
                    </CardTitle>
                    <CardDescription>{org.type}</CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${org.status === 'Active' ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'}`}>
                    {org.status}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Locations</p>
                        <p className="text-xl">{org.locations}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Beds</p>
                        <p className="text-xl">{org.totalBeds}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Staff</p>
                        <p className="text-xl">{org.totalStaff}</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {org.contact.address}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        {org.contact.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {org.contact.email}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                          CQC Rating: {org.compliance.cqcRating}
                        </div>
                        <span className="text-muted-foreground">
                          Next Inspection: {org.compliance.nextInspection}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Card key={location.id} className="hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{location.name}</CardTitle>
                  <CardDescription>{location.organization}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <span>{location.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Beds:</span>
                      <span>{location.occupancy}/{location.beds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Staff:</span>
                      <span>{location.staff}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Manager:</span>
                      <span>{location.manager}</span>
                    </div>
                    <div className="mt-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${location.status === 'Operational' ? 'bg-green-100 text-green-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                        {location.status}
                      </span>
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
                    <CardDescription>{doc.organization}</CardDescription>
                  </div>
                  <div className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${doc.status === 'Active' ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'}`}>
                    {doc.status}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-2 h-4 w-4" />
                      {doc.type}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Updated: {doc.lastUpdated}
                      </span>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
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
