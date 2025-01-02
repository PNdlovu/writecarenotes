import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { useClinical } from '../hooks/useClinical';
import { VitalType, ReferralStatus } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ClinicalDashboardProps {
  residentId: string;
  careHomeId: string;
}

export function ClinicalDashboard({ residentId, careHomeId }: ClinicalDashboardProps) {
  const [activeTab, setActiveTab] = useState('vitals');
  const {
    vitals,
    medicalHistory,
    referrals,
    assessments,
    isLoading,
    error,
    setSelectedVitalType
  } = useClinical({ residentId });

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
          {error instanceof Error ? error.message : 'Failed to load clinical data'}
        </AlertDescription>
      </Alert>
    );
  }

  const renderVitalsChart = (type: VitalType) => {
    const filteredVitals = vitals.filter(v => v.type === type);
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredVitals}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2196f3"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Clinical Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive clinical information and monitoring
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>Blood Pressure & Heart Rate</CardHeader>
              <CardContent>
                {renderVitalsChart(VitalType.BLOOD_PRESSURE)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>Temperature & Oxygen Saturation</CardHeader>
              <CardContent>
                {renderVitalsChart(VitalType.TEMPERATURE)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>Medical History</CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 border rounded-lg bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{record.condition}</h3>
                        <p className="text-sm text-gray-500">
                          Diagnosed: {new Date(record.diagnosisDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        record.status === 'ACTIVE' ? 'bg-red-100 text-red-800' :
                        record.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{record.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>Specialist Referrals</CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="p-4 border rounded-lg bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{referral.specialistType}</h3>
                        <p className="text-sm text-gray-500">
                          Referred: {new Date(referral.referralDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        referral.status === ReferralStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        referral.status === ReferralStatus.SCHEDULED ? 'bg-blue-100 text-blue-800' :
                        referral.status === ReferralStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {referral.status}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{referral.reason}</p>
                    {referral.appointmentDate && (
                      <p className="mt-2 text-sm text-gray-500">
                        Appointment: {new Date(referral.appointmentDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>Clinical Assessments</CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 border rounded-lg bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{assessment.assessmentType}</h3>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      {assessment.score !== undefined && (
                        <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Score: {assessment.score}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-gray-600">{assessment.findings}</p>
                    {assessment.recommendations.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold">Recommendations:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {assessment.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
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
      </Tabs>
    </div>
  );
}
