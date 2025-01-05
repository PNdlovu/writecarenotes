import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Users, Settings, FileText, Bell } from "lucide-react";

export function CareHomeManagement() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Care Home Management</CardTitle>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Home className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="residents">
              <Users className="mr-2 h-4 w-4" />
              Residents
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileText className="mr-2 h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="mr-2 h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ScrollArea className="h-[400px]">
              <div className="grid gap-4 md:grid-cols-2">
                {overviewCards.map((card) => (
                  <Card key={card.title}>
                    <CardHeader>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">{card.value}</div>
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="residents">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {residents.map((resident) => (
                  <Card key={resident.id}>
                    <CardContent className="flex justify-between items-center py-4">
                      <div>
                        <h3 className="font-medium">{resident.name}</h3>
                        <p className="text-sm text-gray-500">Room {resident.room}</p>
                      </div>
                      <Badge variant={resident.status === 'Active' ? 'success' : 'secondary'}>
                        {resident.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="compliance">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {complianceItems.map((item) => (
                  <Card key={item.title}>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge variant={item.status === 'Compliant' ? 'success' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      {item.dueDate && (
                        <p className="text-sm text-gray-500 mt-2">
                          Due: {item.dueDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alerts">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        <Badge variant={getAlertVariant(alert.priority)}>
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{alert.message}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">{alert.time}</span>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function getAlertVariant(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    default:
      return 'secondary';
  }
}

const overviewCards = [
  {
    title: 'Total Residents',
    value: '42',
    description: 'Current occupancy rate: 87%'
  },
  {
    title: 'Staff on Duty',
    value: '12',
    description: 'Including 4 nurses and 8 care workers'
  },
  {
    title: 'Pending Tasks',
    value: '8',
    description: '3 high priority tasks requiring attention'
  },
  {
    title: 'Compliance Score',
    value: '96%',
    description: 'Last audit completed: 2 days ago'
  }
];

const residents = [
  {
    id: 1,
    name: 'John Smith',
    room: '101',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Mary Johnson',
    room: '102',
    status: 'Hospital'
  },
  {
    id: 3,
    name: 'Robert Wilson',
    room: '103',
    status: 'Active'
  }
];

const complianceItems = [
  {
    title: 'CQC Documentation',
    status: 'Compliant',
    description: 'All required documentation is up to date',
    dueDate: 'Next review: 30 days'
  },
  {
    title: 'Staff Training',
    status: 'Action Required',
    description: '3 staff members require updated certifications',
    dueDate: 'Due in 7 days'
  },
  {
    title: 'Health & Safety',
    status: 'Compliant',
    description: 'All checks completed and documented',
    dueDate: 'Next audit: 14 days'
  }
];

const alerts = [
  {
    id: 1,
    title: 'Medication Review Required',
    message: 'Three residents due for medication review this week',
    priority: 'High',
    time: '1 hour ago'
  },
  {
    id: 2,
    title: 'Staff Coverage Alert',
    message: 'Night shift requires additional coverage for tomorrow',
    priority: 'Medium',
    time: '2 hours ago'
  },
  {
    id: 3,
    title: 'Maintenance Request',
    message: 'Room 105 reported issues with heating system',
    priority: 'Low',
    time: '3 hours ago'
  }
];
