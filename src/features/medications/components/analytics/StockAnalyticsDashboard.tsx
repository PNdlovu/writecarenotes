/**
 * @writecarenotes.com
 * @fileoverview Stock analytics dashboard
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Dashboard component for displaying medication stock analytics
 * including usage trends, wastage, costs, and forecasts.
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/Button/Button';
import { useOrganization } from '@/hooks/useOrganization';
import { useStock } from '../../hooks/useStock';
import { StockAnalyticsService } from '../../services/stockAnalyticsService';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Download } from 'lucide-react';

const analyticsService = new StockAnalyticsService();

export function StockAnalyticsDashboard() {
  const { organizationId } = useOrganization();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['stock-analytics', organizationId, dateRange],
    queryFn: () =>
      analyticsService.getStockAnalytics(
        organizationId,
        dateRange.from,
        dateRange.to
      ),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        <p>Error loading analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Stock Analytics</h2>
        <div className="flex items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.summary.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              During selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Wastage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics.summary.totalWastage)} units
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.wastagePercentage.toFixed(1)}% of total stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potential Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(analytics.summary.potentialLoss)}
            </div>
            <p className="text-xs text-muted-foreground">
              From expiring stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.forecast.filter(f => f.daysToExpiry <= 90).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Within next 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>
            View detailed stock analytics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="wastage">Wastage</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="expiry">Expiry</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.costs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="medicationName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="purchaseCost"
                      name="Purchase Cost"
                      stroke="#0ea5e9"
                    />
                    <Line
                      type="monotone"
                      dataKey="usageCost"
                      name="Usage Cost"
                      stroke="#f43f5e"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="wastage">
              <div className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.wastage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="medicationName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="quantity"
                        name="Wasted Units"
                        fill="#f43f5e"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Instances</TableHead>
                      <TableHead>Common Reasons</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.wastage.map((item) => (
                      <TableRow key={item.medicationId}>
                        <TableCell>{item.medicationName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.instances}</TableCell>
                        <TableCell>{item.reasons.join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="costs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Purchase Cost</TableHead>
                    <TableHead>Usage Cost</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.costs.map((item) => (
                    <TableRow key={item.medicationId}>
                      <TableCell>{item.medicationName}</TableCell>
                      <TableCell>{formatCurrency(item.purchaseCost)}</TableCell>
                      <TableCell>{formatCurrency(item.usageCost)}</TableCell>
                      <TableCell>{item.receivedQuantity}</TableCell>
                      <TableCell>{item.usedQuantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="expiry">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Potential Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.forecast
                    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
                    .map((item) => (
                      <TableRow
                        key={`${item.medicationId}-${item.batchNumber}`}
                        className={
                          item.daysToExpiry <= 30
                            ? 'bg-destructive/10'
                            : item.daysToExpiry <= 90
                            ? 'bg-warning/10'
                            : undefined
                        }
                      >
                        <TableCell>{item.medicationName}</TableCell>
                        <TableCell>{item.batchNumber}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatDate(item.expiryDate)}</TableCell>
                        <TableCell>{item.daysToExpiry}</TableCell>
                        <TableCell>{formatCurrency(item.estimatedLoss)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 