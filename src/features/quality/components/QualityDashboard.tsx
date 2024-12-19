import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useQuality } from '../hooks/useQuality';
import { QualityMetricType, ComplianceLevel, ImprovementPriority } from '../types';
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
  ResponsiveContainer
} from 'recharts';

interface QualityDashboardProps {
  careHomeId: string;
}

export function QualityDashboard({ careHomeId }: QualityDashboardProps) {
  const [activeTab, setActiveTab] = useState('metrics');
  const [selectedPeriod, setSelectedPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const {
    metrics,
    inspections,
    improvementPlans,
    audits,
    isLoading,
    error,
    setSelectedMetricType,
    setDateRange,
    getQualityTrends,
    getBenchmarkData
  } = useQuality({ careHomeId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load quality data'}
        </AlertDescription>
      </Alert>
    );
  }

  const renderMetricsChart = (type: QualityMetricType) => {
    const filteredMetrics = metrics.filter(m => m.type === type);
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredMetrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
          />
          <Legend />
          <Line
            name="Actual"
            type="monotone"
            dataKey="value"
            stroke="#2196f3"
            activeDot={{ r: 8 }}
          />
          <Line
            name="Target"
            type="monotone"
            dataKey="target"
            stroke="#4caf50"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Quality Management Dashboard</h1>
        <p className="text-gray-600">
          Monitor and improve care quality metrics and compliance
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <DateRangePicker
          onChange={(range) => setDateRange({
            start: range.from,
            end: range.to
          })}
        />
        <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="improvements">Improvement Plans</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>Resident Satisfaction & Care Quality</CardHeader>
              <CardContent>
                {renderMetricsChart(QualityMetricType.RESIDENT_SATISFACTION)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>Staff Performance & Training</CardHeader>
              <CardContent>
                {renderMetricsChart(QualityMetricType.TRAINING_COMPLETION)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inspections">
          <Card>
            <CardHeader>Recent Inspections</CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="p-4 border rounded-lg bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{inspection.inspectionType}</h3>
                        <p className="text-sm text-gray-500">
                          Scheduled: {new Date(inspection.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        inspection.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        inspection.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inspection.status}
                      </span>
                    </div>
                    {inspection.findings && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Key Findings:</h4>
                        <ul className="space-y-2">
                          {inspection.findings.map((finding, index) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{finding.category}</span>
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                finding.compliance === ComplianceLevel.COMPLIANT ? 'bg-green-100 text-green-800' :
                                finding.compliance === ComplianceLevel.PARTIALLY_COMPLIANT ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {finding.compliance}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements">
          <Card>
            <CardHeader>Active Improvement Plans</CardHeader>
            <CardContent>
              <div className="space-y-4">
                {improvementPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 border rounded-lg bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="text-sm text-gray-500">
                          Target Date: {new Date(plan.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        plan.priority === ImprovementPriority.CRITICAL ? 'bg-red-100 text-red-800' :
                        plan.priority === ImprovementPriority.HIGH ? 'bg-orange-100 text-orange-800' :
                        plan.priority === ImprovementPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {plan.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{plan.description}</p>
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Progress:</h4>
                      <div className="space-y-2">
                        {plan.tasks.map((task, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{task.description}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader>Quality Audits</CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="p-4 border rounded-lg bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{audit.auditType}</h3>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(audit.auditDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        Auditor: {audit.auditor}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Findings:</h4>
                      <div className="space-y-2">
                        {audit.findings.map((finding, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{finding.area}</span>
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  finding.compliance === ComplianceLevel.COMPLIANT ? 'bg-green-100 text-green-800' :
                                  finding.compliance === ComplianceLevel.PARTIALLY_COMPLIANT ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {finding.compliance}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  finding.risk === 'HIGH' ? 'bg-red-100 text-red-800' :
                                  finding.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {finding.risk} Risk
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{finding.observation}</p>
                            {finding.recommendation && (
                              <p className="text-sm text-gray-600 mt-1">
                                Recommendation: {finding.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
