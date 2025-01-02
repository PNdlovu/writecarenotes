import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Download, Filter, BarChart as ChartIcon, LineChart as TrendIcon, PieChart as PieIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";

export function AdvancedReporting() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Advanced Reporting</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex gap-4">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="nursing">Nursing</SelectItem>
              <SelectItem value="care">Care Workers</SelectItem>
              <SelectItem value="admin">Administration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <ChartIcon className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendIcon className="mr-2 h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <PieIcon className="mr-2 h-4 w-4" />
              Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart data={utilizationData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shift Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart data={coverageData} />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends">
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overtime Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart data={overtimeTrends} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Absence Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart data={absencePatterns} />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="distribution">
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart data={staffDistribution} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shift Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart data={shiftDistribution} />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Sample data structures (replace with actual data from your API)
const utilizationData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Utilization %',
      data: [75, 82, 88, 85, 80, 70, 65],
    },
  ],
};

const coverageData = {
  labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
  datasets: [
    {
      label: 'Coverage %',
      data: [95, 88, 85, 78],
    },
  ],
};

const overtimeTrends = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Overtime Hours',
      data: [24, 18, 22, 20],
    },
  ],
};

const absencePatterns = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Absence Rate %',
      data: [3.5, 4.2, 3.8, 3.2],
    },
  ],
};

const staffDistribution = {
  labels: ['Nurses', 'Care Workers', 'Admin', 'Support'],
  datasets: [
    {
      data: [30, 45, 15, 10],
    },
  ],
};

const shiftDistribution = {
  labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
  datasets: [
    {
      data: [35, 30, 25, 10],
    },
  ],
};
