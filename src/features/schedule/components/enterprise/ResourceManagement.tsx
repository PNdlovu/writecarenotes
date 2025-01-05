import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge/Badge";
import { Progress } from "@/components/ui/Progress/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";

export function ResourceManagement() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resource Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Staff Allocation</h3>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>{dept.staffCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={dept.utilization} className="w-[100px]" />
                          <span className="text-sm">{dept.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(dept.status)}>
                          {dept.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Resource Alerts</h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.type === 'critical' ? 'destructive' : 'warning'}>
                        {alert.type}
                      </Badge>
                      <h4 className="font-medium">{alert.title}</h4>
                    </div>
                    <span className="text-sm text-gray-500">{alert.time}</span>
                  </div>
                  <p className="text-gray-700">{alert.message}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Take Action</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'optimal':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'destructive';
    default:
      return 'default';
  }
}

const departments = [
  { id: 1, name: 'Emergency', staffCount: 15, utilization: 85, status: 'Warning' },
  { id: 2, name: 'ICU', staffCount: 12, utilization: 90, status: 'Critical' },
  { id: 3, name: 'General Ward', staffCount: 20, utilization: 75, status: 'Optimal' },
  { id: 4, name: 'Pediatrics', staffCount: 10, utilization: 80, status: 'Warning' },
];

const alerts = [
  {
    id: 1,
    type: 'critical',
    title: 'ICU Staff Shortage',
    message: 'Immediate attention required: ICU department is understaffed for the night shift.',
    time: '10 mins ago'
  },
  {
    id: 2,
    type: 'warning',
    title: 'High Utilization',
    message: 'Emergency department approaching maximum capacity. Consider staff reallocation.',
    time: '1 hour ago'
  },
];
