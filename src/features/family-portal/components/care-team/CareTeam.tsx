import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  availability: string[];
  contactInfo: {
    email: string;
    phone: string;
  };
  image?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'OFF_DUTY';
  lastInteraction?: Date;
  nextScheduled?: Date;
}

interface CareTeamProps {
  residentId: string;
}

export const CareTeam: React.FC<CareTeamProps> = ({
  residentId,
}) => {
  const [activeTab, setActiveTab] = useState('current');
  const [selectedMember, setSelectedMember] = useState<CareTeamMember | null>(null);

  // Mock data - replace with actual API calls
  const careTeam: CareTeamMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Primary Care Physician',
      specialty: 'Geriatrics',
      availability: ['Mon 9-5', 'Wed 9-5', 'Fri 9-1'],
      contactInfo: {
        email: 'sarah.johnson@example.com',
        phone: '555-0123'
      },
      status: 'ACTIVE',
      lastInteraction: new Date(),
      nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Care Team</h2>
          <p className="text-muted-foreground">
            Your dedicated healthcare professionals
          </p>
        </div>
        <Button>Contact Care Team</Button>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current Team</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careTeam.map((member) => (
              <Card
                key={member.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.image} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {member.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    {member.specialty && (
                      <p className="text-sm text-muted-foreground">{member.specialty}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">Next Available: {member.availability[0]}</p>
                      {member.lastInteraction && (
                        <p className="text-sm">
                          Last Interaction: {member.lastInteraction.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="p-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {careTeam.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      {member.nextScheduled && (
                        <Badge>
                          Next: {member.nextScheduled.toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-semibold">Available Times:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.availability.map((time, index) => (
                          <Badge key={index} variant="outline">{time}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-4">
            <div className="space-y-4">
              {/* Historical interactions would go here */}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedMember.name}</DialogTitle>
              <DialogDescription>{selectedMember.role}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Contact Information</h4>
                <p>Email: {selectedMember.contactInfo.email}</p>
                <p>Phone: {selectedMember.contactInfo.phone}</p>
              </div>
              <div>
                <h4 className="font-semibold">Availability</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.availability.map((time, index) => (
                    <Badge key={index} variant="outline">{time}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Recent Interactions</h4>
                {/* Recent interactions would go here */}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
              <Button>Schedule Meeting</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};


