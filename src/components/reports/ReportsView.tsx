import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportsViewProps {
  region: string;
}

export default function ReportsView({ region }: ReportsViewProps) {
  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold tracking-tight">Reports - {region}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Care Quality Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and generate care quality reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Access incident and accident reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Monitor regulatory compliance status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Staff training and performance reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resident Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Resident care and assessment reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Performance metrics and trends</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


