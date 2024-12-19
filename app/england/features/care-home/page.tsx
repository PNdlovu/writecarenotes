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
import {
  Home,
  Users,
  Bed,
  Phone,
  MapPin,
  Mail,
  Shield,
  FileText,
  Settings,
  AlertCircle
} from "lucide-react";

const careHomeInfo = {
  name: "Sunrise Care Home",
  address: "123 Care Street, London, UK",
  phone: "+44 20 1234 5678",
  email: "info@sunrisecare.com",
  license: "CQC-123456",
  capacity: {
    total: 50,
    occupied: 42,
    available: 8
  },
  staff: {
    total: 30,
    nurses: 8,
    caregivers: 15,
    support: 7
  }
};

const facilities = [
  {
    name: "Medical Wing",
    status: "Operational",
    lastInspection: "2024-11-30",
    nextInspection: "2025-01-30"
  },
  {
    name: "Dining Hall",
    status: "Operational",
    lastInspection: "2024-12-01",
    nextInspection: "2025-02-01"
  },
  {
    name: "Activity Center",
    status: "Operational",
    lastInspection: "2024-12-05",
    nextInspection: "2025-02-05"
  },
  {
    name: "Garden Area",
    status: "Maintenance Scheduled",
    lastInspection: "2024-12-10",
    nextInspection: "2025-02-10"
  }
];

const certifications = [
  {
    name: "CQC Registration",
    status: "Valid",
    expiryDate: "2025-12-31",
    lastAudit: "2024-06-15"
  },
  {
    name: "Fire Safety Certificate",
    status: "Valid",
    expiryDate: "2025-03-31",
    lastAudit: "2024-09-20"
  },
  {
    name: "Food Safety Certificate",
    status: "Valid",
    expiryDate: "2025-06-30",
    lastAudit: "2024-11-15"
  }
];

export default function CareHomePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Care Home Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                {careHomeInfo.address}
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                {careHomeInfo.phone}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {careHomeInfo.email}
              </div>
              <div className="flex items-center text-sm">
                <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                License: {careHomeInfo.license}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bed className="mr-2 h-5 w-5" />
              Capacity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span>Total Beds:</span>
                <span className="font-medium">{careHomeInfo.capacity.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Occupied:</span>
                <span className="font-medium">{careHomeInfo.capacity.occupied}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available:</span>
                <span className="font-medium">{careHomeInfo.capacity.available}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Staff Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span>Total Staff:</span>
                <span className="font-medium">{careHomeInfo.staff.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Nurses:</span>
                <span className="font-medium">{careHomeInfo.staff.nurses}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Caregivers:</span>
                <span className="font-medium">{careHomeInfo.staff.caregivers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Support Staff:</span>
                <span className="font-medium">{careHomeInfo.staff.support}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="facilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {facilities.map((facility, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{facility.name}</CardTitle>
                  <CardDescription>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                      ${facility.status === 'Operational' ? 'bg-green-100 text-green-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                      {facility.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Last Inspection:</span>
                      <span>{facility.lastInspection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Inspection:</span>
                      <span>{facility.nextInspection}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid gap-4">
            {certifications.map((cert, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    {cert.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-green-600">{cert.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiry Date:</span>
                      <span>{cert.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Audit:</span>
                      <span>{cert.lastAudit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
            Emergency Procedures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div>Emergency Response Team: +44 20 9876 5432</div>
            <div>Fire Safety Officer: John Smith</div>
            <div>Assembly Point: Main Car Park</div>
            <Button variant="outline" className="mt-2">
              View Emergency Protocols
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
