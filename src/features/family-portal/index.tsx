import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs/Tabs";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

import { FamilyNetwork } from './components/network/FamilyNetwork';
import { DocumentCenter } from './components/documents/DocumentCenter';
import { VisitingSchedule } from './components/visiting/VisitingSchedule';
import { CommunicationLog } from './components/communication/CommunicationLog';
import { CareTeam } from './components/care-team/CareTeam';
import { ConsentManagement } from './components/consent/ConsentManagement';
import { VideoCall } from './components/video-call/VideoCall';

interface FamilyPortalProps {
  residentId: string;
  familyMemberId: string;
  careHomeId: string;
}

export const FamilyPortal: React.FC<FamilyPortalProps> = ({
  residentId,
  familyMemberId,
  careHomeId,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Family Portal</h1>
          <p className="text-muted-foreground">
            Stay connected with your loved one's care
          </p>
        </div>
        <Button>Emergency Contact</Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="care-team">Care Team</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
          <TabsTrigger value="video">Video Call</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Recent Updates</h3>
              {/* Recent updates content */}
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Upcoming Events</h3>
              {/* Upcoming events content */}
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              {/* Quick actions content */}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network">
          <FamilyNetwork residentId={residentId} familyMemberId={familyMemberId} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentCenter residentId={residentId} familyMemberId={familyMemberId} />
        </TabsContent>

        <TabsContent value="visits">
          <VisitingSchedule residentId={residentId} familyMemberId={familyMemberId} />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationLog residentId={residentId} familyMemberId={familyMemberId} />
        </TabsContent>

        <TabsContent value="care-team">
          <CareTeam residentId={residentId} />
        </TabsContent>

        <TabsContent value="consent">
          <ConsentManagement residentId={residentId} familyMemberId={familyMemberId} />
        </TabsContent>

        <TabsContent value="video">
          <Card className="p-4">
            <VideoCall
              residentId={residentId}
              familyMemberId={familyMemberId}
              careHomeId={careHomeId}
              isGroup={false}
            />
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-4">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            {/* Settings content */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


