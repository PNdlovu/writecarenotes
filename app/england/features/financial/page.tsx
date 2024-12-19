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
  CreditCard,
  Receipt,
  ArrowUpDown,
  Clock,
  Building2
} from "lucide-react";

const transactions = [
  {
    id: "TRX001",
    date: "2024-12-15",
    type: "Income",
    category: "Care Fees",
    description: "Monthly Care Fee - John Smith",
    amount: 2500.00,
    status: "Completed",
    reference: "CF-2024121501"
  },
  {
    id: "TRX002",
    date: "2024-12-15",
    type: "Expense",
    category: "Supplies",
    description: "Medical Supplies Restock",
    amount: -750.25,
    status: "Completed",
    reference: "EXP-2024121502"
  },
  {
    id: "TRX003",
    date: "2024-12-14",
    type: "Income",
    category: "Additional Services",
    description: "Physiotherapy Session - Mary Johnson",
    amount: 150.00,
    status: "Pending",
    reference: "AS-2024121401"
  }
];

const invoices = [
  {
    id: "INV001",
    resident: "John Smith",
    date: "2024-12-01",
    dueDate: "2024-12-15",
    amount: 2500.00,
    status: "Paid",
    type: "Care Fees"
  },
  {
    id: "INV002",
    resident: "Mary Johnson",
    date: "2024-12-01",
    dueDate: "2024-12-15",
    amount: 2750.00,
    status: "Pending",
    type: "Care Fees"
  },
  {
    id: "INV003",
    resident: "Robert Wilson",
    date: "2024-12-01",
    dueDate: "2024-12-15",
    amount: 2300.00,
    status: "Overdue",
    type: "Care Fees"
  }
];

const budgets = [
  {
    id: "BUD001",
    category: "Staff Salaries",
    allocated: 45000.00,
    spent: 42500.00,
    remaining: 2500.00,
    status: "On Track"
  },
  {
    id: "BUD002",
    category: "Medical Supplies",
    allocated: 5000.00,
    spent: 4250.25,
    remaining: 749.75,
    status: "On Track"
  },
  {
    id: "BUD003",
    category: "Food & Catering",
    allocated: 8000.00,
    spent: 7800.00,
    remaining: 200.00,
    status: "Warning"
  }
];

export default function FinancialPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financial Management</h2>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£75,250.00</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£12,450.00</div>
            <p className="text-xs text-muted-foreground">8 pending invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£52,800.00</div>
            <p className="text-xs text-muted-foreground">+4.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">On Track</div>
            <p className="text-xs text-muted-foreground">85% of budget utilized</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-8" />
              </div>
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                      £{Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${transaction.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                        {transaction.status}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.resident}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>£{invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
                        {invoice.status}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search budgets..." className="pl-8" />
              </div>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Budget
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell>{budget.category}</TableCell>
                    <TableCell>£{budget.allocated.toFixed(2)}</TableCell>
                    <TableCell>£{budget.spent.toFixed(2)}</TableCell>
                    <TableCell>£{budget.remaining.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${budget.status === 'On Track' ? 'bg-green-100 text-green-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                        {budget.status}
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
