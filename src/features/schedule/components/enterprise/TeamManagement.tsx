import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Calendar, Settings } from "lucide-react";

export function TeamManagement() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Team Management</CardTitle>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="team">
              <Users className="mr-2 h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'Active' ? 'success' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="space-y-4">
              {scheduleItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={item.avatar} alt={item.name} />
                        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.shift}</div>
                      </div>
                    </div>
                    <Badge>{item.type}</Badge>
                  </div>
                  <div className="text-sm text-gray-700">{item.notes}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{setting.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{setting.description}</p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@writenotes.com',
    role: 'Team Lead',
    status: 'Active',
    avatar: '/avatars/sarah.jpg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'm.chen@writenotes.com',
    role: 'Care Coordinator',
    status: 'Active',
    avatar: '/avatars/michael.jpg'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    email: 'e.wilson@writenotes.com',
    role: 'Care Worker',
    status: 'On Leave',
    avatar: '/avatars/emma.jpg'
  },
];

const scheduleItems = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    shift: 'Morning Shift',
    type: 'Regular',
    notes: 'Team meeting at 9 AM'
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: '/avatars/michael.jpg',
    shift: 'Evening Shift',
    type: 'Coverage',
    notes: 'Covering for Emma'
  },
];

const settings = [
  {
    id: 1,
    title: 'Team Permissions',
    description: 'Configure access levels and permissions for team members'
  },
  {
    id: 2,
    title: 'Schedule Rules',
    description: 'Set up scheduling rules and preferences'
  },
  {
    id: 3,
    title: 'Notifications',
    description: 'Manage team notifications and alerts'
  },
];
