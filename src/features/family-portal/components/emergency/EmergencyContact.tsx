import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  priority: number;
  availability: string;
  lastUpdated: Date;
  notes?: string;
}

interface EmergencyContactProps {
  residentId: string;
  familyMemberId: string;
}

export const EmergencyContact: React.FC<EmergencyContactProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'John Doe',
      relationship: 'Son',
      primaryPhone: '555-0123',
      secondaryPhone: '555-4567',
      email: 'john.doe@example.com',
      address: '123 Main St, City, State 12345',
      priority: 1,
      availability: '24/7',
      lastUpdated: new Date(),
      notes: 'Primary emergency contact, lives nearby'
    }
  ];

  const handleEmergency = () => {
    setIsEmergencyDialogOpen(true);
    // Implement emergency notification system
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Emergency Contacts</h2>
          <p className="text-muted-foreground">
            Manage emergency contacts and quick response
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsAddContactOpen(true)}>
            Add Contact
          </Button>
          <Button variant="destructive" onClick={handleEmergency}>
            Emergency Alert
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Emergency Contacts List</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{contact.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {contact.relationship}
                      </p>
                    </div>
                    <Badge>Priority {contact.priority}</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-semibold">Primary Phone:</span>{' '}
                      {contact.primaryPhone}
                    </p>
                    {contact.secondaryPhone && (
                      <p className="text-sm">
                        <span className="font-semibold">Secondary Phone:</span>{' '}
                        {contact.secondaryPhone}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-semibold">Email:</span> {contact.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Address:</span>{' '}
                      {contact.address}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Availability:</span>{' '}
                      {contact.availability}
                    </p>
                  </div>
                  {contact.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {contact.notes}
                    </p>
                  )}
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Emergency Resources</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold">Local Emergency Services</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm">Police: 911</p>
                <p className="text-sm">Fire Department: 911</p>
                <p className="text-sm">Ambulance: 911</p>
                <p className="text-sm">Poison Control: 1-800-222-1222</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold">Facility Emergency Contacts</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm">Front Desk: 555-0000</p>
                <p className="text-sm">Nurse Station: 555-0001</p>
                <p className="text-sm">Security: 555-0002</p>
                <p className="text-sm">Maintenance: 555-0003</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold">Emergency Procedures</h4>
              <div className="mt-2 space-y-2">
                <Button variant="outline" className="w-full">
                  View Emergency Protocol
                </Button>
                <Button variant="outline" className="w-full">
                  Download Emergency Guide
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
            <DialogDescription>
              Add a new emergency contact for quick response
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Full name" />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input placeholder="Relationship to resident" />
            </div>
            <div>
              <Label>Primary Phone</Label>
              <Input placeholder="Primary phone number" />
            </div>
            <div>
              <Label>Secondary Phone (Optional)</Label>
              <Input placeholder="Secondary phone number" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="Email address" />
            </div>
            <div>
              <Label>Address</Label>
              <Input placeholder="Full address" />
            </div>
            <div>
              <Label>Priority Level (1-5)</Label>
              <Input type="number" min="1" max="5" />
            </div>
            <div>
              <Label>Availability</Label>
              <Input placeholder="e.g., 24/7, Weekdays 9-5" />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input placeholder="Additional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
              Cancel
            </Button>
            <Button>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Emergency Alert</DialogTitle>
            <DialogDescription>
              This will notify all emergency contacts immediately
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Emergency Type</Label>
              <Input placeholder="Describe the emergency" />
            </div>
            <div>
              <Label>Additional Details</Label>
              <Input placeholder="Provide any relevant details" />
            </div>
            <div>
              <Label>Location</Label>
              <Input placeholder="Specify location if applicable" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmergencyDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Send Emergency Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


