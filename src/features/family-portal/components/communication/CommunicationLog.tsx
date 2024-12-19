import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Textarea } from "@/components/ui/form/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Communication {
  id: string;
  type: 'CALL' | 'MESSAGE' | 'EMAIL' | 'VIDEO' | 'IN_PERSON';
  sender: string;
  recipient: string;
  timestamp: Date;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'REPLIED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: string[];
  followUpRequired?: boolean;
}

interface CommunicationLogProps {
  residentId: string;
  familyMemberId: string;
}

export const CommunicationLog: React.FC<CommunicationLogProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  // Mock data - replace with actual API calls
  const communications: Communication[] = [
    {
      id: '1',
      type: 'MESSAGE',
      sender: 'Care Staff',
      recipient: 'Family Member',
      timestamp: new Date(),
      content: 'Daily wellness update: Great participation in morning activities',
      status: 'DELIVERED',
      priority: 'MEDIUM',
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Communication Log</h2>
          <p className="text-muted-foreground">
            Track all communications with care staff
          </p>
        </div>
        <Button onClick={() => setIsNewMessageOpen(true)}>
          New Message
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Communications</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="p-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{comm.sender}</h4>
                          <Badge variant={comm.priority === 'URGENT' ? 'destructive' : 'default'}>
                            {comm.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comm.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">{comm.type}</Badge>
                    </div>
                    <p className="mt-2">{comm.content}</p>
                    {comm.attachments && comm.attachments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold">Attachments:</p>
                        <div className="flex gap-2">
                          {comm.attachments.map((att, index) => (
                            <Badge key={index} variant="outline">{att}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <Badge variant="outline">{comm.status}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Reply</Button>
                        <Button variant="outline" size="sm">Forward</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Similar content for other tabs */}
      </Tabs>

      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Send a message to care staff or family members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Care Staff</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="family">All Family Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input placeholder="Subject" />
            </div>
            <div>
              <Textarea placeholder="Type your message here..." className="h-32" />
            </div>
            <div>
              <Input type="file" multiple />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
              Cancel
            </Button>
            <Button>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


