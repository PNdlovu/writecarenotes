'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResidents } from "@/features/residents/hooks/use-residents";
import { useAssessments } from "@/features/assessments/hooks/use-assessments";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  const { residents, isLoading: isLoadingResidents } = useResidents();
  const { assessments, isLoading: isLoadingAssessments } = useAssessments();

  const careLevelStats = residents?.reduce((acc, resident) => {
    acc[resident.careLevel] = (acc[resident.careLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const careLevelData = Object.entries(careLevelStats || {}).map(([name, value]) => ({
    name,
    total: value,
  }));

  const recentAssessments = assessments?.slice(0, 5) || [];

  if (isLoadingResidents || isLoadingAssessments) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residents?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Care Residents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {careLevelStats?.['High Care'] || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Care Residents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {careLevelStats?.['Medium Care'] || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Care Residents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {careLevelStats?.['Low Care'] || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Care Level Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={careLevelData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Bar
                  dataKey="total"
                  fill="#adfa1d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {assessment.residentName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {assessment.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
