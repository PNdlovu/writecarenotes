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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  PlusCircle,
  Building2,
  Users,
  Truck,
  ShieldCheck,
  Wrench,
  Calendar,
  ClipboardList,
  AlertCircle
} from "lucide-react";

const maintenanceRequests = [
  {
    id: "MNT001",
    title: "Fix Bathroom Leak",
    priority: "High",
    status: "In Progress",
    location: "Room 102",
    requestedBy: "Sarah Wilson",
    assignedTo: "Maintenance Team",
    dueDate: "2024-12-18"
  },
  {
    id: "MNT002",
    title: "Replace Light Fixtures",
    priority: "Medium",
    status: "Scheduled",
    location: "Common Area",
    requestedBy: "John Smith",
    assignedTo: "Electrical Team",
    dueDate: "2024-12-20"
  },
  {
    id: "MNT003",
    title: "HVAC Maintenance",
    priority: "Low",
    status: "Completed",
    location: "Building A",
    requestedBy: "Emma Thompson",
    assignedTo: "HVAC Team",
    dueDate: "2024-12-15"
  }
];

const supplies = [
  {
    id: "SUP001",
    item: "Medical Gloves",
    category: "PPE",
    currentStock: 2500,
    minimumStock: 1000,
    status: "Adequate",
    lastOrdered: "2024-12-10",
    nextDelivery: "2024-12-17"
  },
  {
    id: "SUP002",
    item: "Hand Sanitizer",
    category: "Hygiene",
    currentStock: 150,
    minimumStock: 200,
    status: "Low",
    lastOrdered: "2024-12-14",
    nextDelivery: "2024-12-18"
  },
  {
    id: "SUP003",
    item: "Bed Linens",
    category: "Bedding",
    currentStock: 300,
    minimumStock: 100,
    status: "Adequate",
    lastOrdered: "2024-12-05",
    nextDelivery: null
  }
];

const vendors = [
  {
    id: "VEN001",
    name: "MedSupply Ltd",
    category: "Medical Supplies",
    status: "Active",
    lastDelivery: "2024-12-14",
    rating: 4.8,
    contactPerson: "David Brown",
    phone: "+44 20 1234 5678"
  },
  {
    id: "VEN002",
    name: "CleanPro Services",
    category: "Cleaning",
    status: "Active",
    lastDelivery: "2024-12-12",
    rating: 4.5,
    contactPerson: "Lisa White",
    phone: "+44 20 2345 6789"
  },
  {
    id: "VEN003",
    name: "FoodCare Catering",
    category: "Food Services",
    status: "Under Review",
    lastDelivery: "2024-12-15",
    rating: 3.9,
    contactPerson: "Michael Green",
    phone: "+44 20 3456 7890"
  }
];

export default function OperationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Operations Management</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 high priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Reorder required</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Expected this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">2 under review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="supplies">Supplies</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search maintenance requests..." className="pl-8" />
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
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <Badge variant={
                        request.priority === 'High' ? 'destructive' :
                        request.priority === 'Medium' ? 'warning' :
                        'secondary'
                      }>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        request.status === 'Completed' ? 'success' :
                        request.status === 'In Progress' ? 'warning' :
                        'secondary'
                      }>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.location}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>{request.assignedTo}</TableCell>
                    <TableCell>{request.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search supplies..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Order Supplies
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Minimum Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Ordered</TableHead>
                  <TableHead>Next Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplies.map((supply) => (
                  <TableRow key={supply.id}>
                    <TableCell>{supply.id}</TableCell>
                    <TableCell>{supply.item}</TableCell>
                    <TableCell>{supply.category}</TableCell>
                    <TableCell>{supply.currentStock}</TableCell>
                    <TableCell>{supply.minimumStock}</TableCell>
                    <TableCell>
                      <Badge variant={
                        supply.status === 'Adequate' ? 'success' :
                        'destructive'
                      }>
                        {supply.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{supply.lastOrdered}</TableCell>
                    <TableCell>{supply.nextDelivery || 'Not Scheduled'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search vendors..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Delivery</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>{vendor.id}</TableCell>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>{vendor.category}</TableCell>
                    <TableCell>
                      <Badge variant={
                        vendor.status === 'Active' ? 'success' :
                        'warning'
                      }>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{vendor.lastDelivery}</TableCell>
                    <TableCell>{vendor.rating}/5.0</TableCell>
                    <TableCell>{vendor.contactPerson}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>
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
