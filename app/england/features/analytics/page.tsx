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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Heart,
  AlertTriangle,
  Pill,
  Clock
} from "lucide-react";

// Sample data for charts
const occupancyData = [
  { month: 'Jan', occupancy: 85 },
  { month: 'Feb', occupancy: 88 },
  { month: 'Mar', occupancy: 87 },
  { month: 'Apr', occupancy: 89 },
  { month: 'May', occupancy: 86 },
  { month: 'Jun', occupancy: 90 },
  { month: 'Jul', occupancy: 92 },
  { month: 'Aug', occupancy: 91 },
  { month: 'Sep', occupancy: 89 },
  { month: 'Oct', occupancy: 88 },
  { month: 'Nov', occupancy: 90 },
  { month: 'Dec', occupancy: 93 }
];

const incidentTypeData = [
  { name: 'Falls', value: 35 },
  { name: 'Medication Errors', value: 20 },
  { name: 'Behavioral', value: 25 },
  { name: 'Other', value: 20 }
];

const staffingData = [
  { day: 'Mon', morning: 12, afternoon: 10, night: 6 },
  { day: 'Tue', morning: 11, afternoon: 10, night: 6 },
  { day: 'Wed', morning: 12, afternoon: 11, night: 6 },
  { day: 'Thu', morning: 11, afternoon: 10, night: 6 },
  { day: 'Fri', morning: 12, afternoon: 10, night: 6 },
  { day: 'Sat', morning: 10, afternoon: 9, night: 5 },
  { day: 'Sun', morning: 10, afternoon: 9, night: 5 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const keyMetrics = [
  {
    title: "Average Length of Stay",
    value: "2.8 years",
    change: "+0.3",
    trend: "up"
  },
  {
    title: "Staff Turnover Rate",
    value: "15%",
    change: "-2%",
    trend: "down"
  },
  {
    title: "Resident Satisfaction",
    value: "4.2/5",
    change: "+0.3",
    trend: "up"
  },
  {
    title: "Care Plan Compliance",
    value: "96%",
    change: "+1%",
    trend: "up"
  }
];

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change} from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trend</CardTitle>
                <CardDescription>Monthly occupancy rate (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="occupancy" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Distribution</CardTitle>
                <CardDescription>By type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incidentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incidentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Staff Coverage</CardTitle>
                <CardDescription>Staff distribution by shift</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="morning" fill="#8884d8" name="Morning Shift" />
                      <Bar dataKey="afternoon" fill="#82ca9d" name="Afternoon Shift" />
                      <Bar dataKey="night" fill="#ffc658" name="Night Shift" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Occupancy Analysis</CardTitle>
              <CardDescription>
                Comprehensive view of occupancy metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="occupancy" 
                      stroke="#8884d8" 
                      name="Occupancy Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Analysis</CardTitle>
              <CardDescription>
                Breakdown of incidents by type and severity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incidentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incidentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Key Findings</h3>
                  <ul className="space-y-2">
                    <li>35% of incidents are falls-related</li>
                    <li>20% involve medication errors</li>
                    <li>25% are behavioral incidents</li>
                    <li>20% are other types of incidents</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staffing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Coverage Analysis</CardTitle>
              <CardDescription>
                Weekly staff distribution across shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="morning" fill="#8884d8" name="Morning Shift" />
                    <Bar dataKey="afternoon" fill="#82ca9d" name="Afternoon Shift" />
                    <Bar dataKey="night" fill="#ffc658" name="Night Shift" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
