import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MessageCircle, Bell, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";

export function CommunicationHub() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Communication Hub</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages">
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Updates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages">
            <ScrollArea className="h-[300px]">
              {messages.map((message) => (
                <div key={message.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{message.sender}</h4>
                    <span className="text-sm text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="notifications">
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => (
                <div key={notification.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant={notification.type === 'urgent' ? 'destructive' : 'default'}>
                        {notification.type}
                      </Badge>
                      <span className="ml-2">{notification.message}</span>
                    </div>
                    <span className="text-sm text-gray-500">{notification.time}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="schedule">
            <ScrollArea className="h-[300px]">
              {scheduleUpdates.map((update) => (
                <div key={update.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{update.title}</h4>
                    <Badge>{update.type}</Badge>
                  </div>
                  <p className="text-gray-700">{update.description}</p>
                  <div className="mt-2 text-sm text-gray-500">{update.time}</div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const messages = [
  { id: 1, sender: 'John Smith', content: 'Can you cover my shift tomorrow?', time: '10:30 AM' },
  { id: 2, sender: 'Sarah Johnson', content: 'Team meeting at 2 PM', time: '11:45 AM' },
];

const notifications = [
  { id: 1, type: 'urgent', message: 'New shift available', time: '1 hour ago' },
  { id: 2, type: 'info', message: 'Schedule updated for next week', time: '2 hours ago' },
];

const scheduleUpdates = [
  { id: 1, title: 'Shift Change', type: 'Update', description: 'Evening shift time changed to 3 PM', time: '2 hours ago' },
  { id: 2, title: 'New Assignment', type: 'New', description: 'You have been assigned to Ward B', time: '3 hours ago' },
];
