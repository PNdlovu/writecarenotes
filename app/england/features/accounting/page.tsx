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
  DollarSign, 
  FileText, 
  Users,
  Calculator,
  Calendar,
  Clock,
  Building2
} from "lucide-react";

const payroll = [
  {
    id: "PAY001",
    employee: "Sarah Wilson",
    role: "Registered Nurse",
    basicPay: 3200.00,
    overtime: 450.00,
    allowances: 200.00,
    deductions: 850.00,
    netPay: 3000.00,
    status: "Processed",
    payPeriod: "December 2024"
  },
  {
    id: "PAY002",
    employee: "Michael Brown",
    role: "Care Assistant",
    basicPay: 2400.00,
    overtime: 300.00,
    allowances: 150.00,
    deductions: 650.00,
    netPay: 2200.00,
    status: "Pending",
    payPeriod: "December 2024"
  },
  {
    id: "PAY003",
    employee: "Emma Thompson",
    role: "Senior Care Assistant",
    basicPay: 2800.00,
    overtime: 0.00,
    allowances: 180.00,
    deductions: 750.00,
    netPay: 2230.00,
    status: "Processed",
    payPeriod: "December 2024"
  }
];

const expenses = [
  {
    id: "EXP001",
    category: "Medical Supplies",
    amount: 1250.00,
    date: "2024-12-14",
    submittedBy: "Clinical Lead",
    status: "Approved",
    vendor: "MedSupply Ltd",
    notes: "Monthly stock replenishment"
  },
  {
    id: "EXP002",
    category: "Training",
    amount: 800.00,
    date: "2024-12-13",
    submittedBy: "HR Manager",
    status: "Pending",
    vendor: "Care Training Solutions",
    notes: "Staff development workshop"
  },
  {
    id: "EXP003",
    category: "Maintenance",
    amount: 450.00,
    date: "2024-12-12",
    submittedBy: "Facility Manager",
    status: "Approved",
    vendor: "Fix-It Services",
    notes: "Emergency plumbing repair"
  }
];

const accounts = [
  {
    id: "ACC001",
    name: "Operating Account",
    type: "Current",
    balance: 85000.00,
    lastTransaction: "2024-12-15",
    status: "Active"
  },
  {
    id: "ACC002",
    name: "Payroll Account",
    type: "Current",
    balance: 45000.00,
    lastTransaction: "2024-12-14",
    status: "Active"
  },
  {
    id: "ACC003",
    name: "Reserve Account",
    type: "Savings",
    balance: 150000.00,
    lastTransaction: "2024-12-10",
    status: "Active"
  }
];

export default function AccountingPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Accounting & Payroll</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£25,450.00</div>
            <p className="text-xs text-muted-foreground">For December 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£3,850.00</div>
            <p className="text-xs text-muted-foreground">5 items pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payroll</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 Dec</div>
            <p className="text-xs text-muted-foreground">13 days remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£280,000.00</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search payroll..." className="pl-8" />
              </div>
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Basic Pay</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell>{pay.employee}</TableCell>
                    <TableCell>{pay.role}</TableCell>
                    <TableCell>£{pay.basicPay.toFixed(2)}</TableCell>
                    <TableCell>£{pay.overtime.toFixed(2)}</TableCell>
                    <TableCell>£{pay.allowances.toFixed(2)}</TableCell>
                    <TableCell>£{pay.deductions.toFixed(2)}</TableCell>
                    <TableCell>£{pay.netPay.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${pay.status === 'Processed' ? 'bg-green-100 text-green-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                        {pay.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search expenses..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>£{expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.submittedBy}</TableCell>
                    <TableCell>{expense.vendor}</TableCell>
                    <TableCell>{expense.notes}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${expense.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                        {expense.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search accounts..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Account
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>£{account.balance.toFixed(2)}</TableCell>
                    <TableCell>{account.lastTransaction}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${account.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'}`}>
                        {account.status}
                      </div>
                    </TableCell>
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
