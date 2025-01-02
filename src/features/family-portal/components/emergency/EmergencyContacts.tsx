import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input/Input";
import { Label } from "@/components/ui/Form/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog/Dialog";
import { Badge } from "@/components/ui/Badge/Badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  priority: number;
  phoneNumber: string;
  email: string;
  notes?: string;
}

interface MedicalInfo {
  allergies: string[];
  conditions: string[];
  medications: string[];
  bloodType: string;
  dnr?: boolean;
  notes?: string;
}

interface EmergencyContactsProps {
  residentId: string;
  familyMemberId: string;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isEditMedicalInfoModalOpen, setIsEditMedicalInfoModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  // Mock data - would be replaced with actual API calls
  const contacts: EmergencyContact[] = [];
  const medicalInfo: MedicalInfo = {
    allergies: [],
    conditions: [],
    medications: [],
    bloodType: '',
    notes: '',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Emergency Information</h2>
          <p className="text-muted-foreground">
            Manage emergency contacts and medical information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsNewContactModalOpen(true)}
          >
            <Icons.userPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsEditMedicalInfoModalOpen(true)}
          >
            <Icons.stethoscope className="mr-2 h-4 w-4" />
            Update Medical Info
          </Button>
        </div>
      </div>

      <Alert variant="destructive">
        <Icons.alertCircle className="h-4 w-4" />
        <AlertTitle>Emergency</AlertTitle>
        <AlertDescription>
          In case of emergency, dial emergency services immediately at your local emergency number.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">Emergency Contacts</h3>
          {contacts.length === 0 ? (
            <p className="text-muted-foreground">No emergency contacts added yet.</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contact.name}</span>
                        <Badge variant="outline">{contact.relationship}</Badge>
                        <Badge variant="destructive">Priority {contact.priority}</Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Icons.phone className="mr-2 h-4 w-4" />
                          {contact.phoneNumber}
                        </div>
                        <div className="flex items-center">
                          <Icons.mail className="mr-2 h-4 w-4" />
                          {contact.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <Icons.edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold tracking-tight">Medical Information</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditMedicalInfoModalOpen(true)}
            >
              <Icons.edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Allergies</h4>
              <p className="text-muted-foreground">
                {medicalInfo.allergies.length > 0
                  ? medicalInfo.allergies.join(', ')
                  : 'No allergies recorded'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Medical Conditions</h4>
              <p className="text-muted-foreground">
                {medicalInfo.conditions.length > 0
                  ? medicalInfo.conditions.join(', ')
                  : 'No conditions recorded'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Current Medications</h4>
              <p className="text-muted-foreground">
                {medicalInfo.medications.length > 0
                  ? medicalInfo.medications.join(', ')
                  : 'No medications recorded'}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <h4 className="font-medium">Blood Type:</h4>
              <span className="text-muted-foreground">
                {medicalInfo.bloodType || 'Not specified'}
              </span>
            </div>

            {medicalInfo.dnr && (
              <Alert variant="destructive">
                <AlertTitle>DNR Order in Place</AlertTitle>
              </Alert>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={isNewContactModalOpen} onOpenChange={setIsNewContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
            <DialogDescription>
              Add a new emergency contact for the resident.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter contact's full name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPOUSE">Spouse</SelectItem>
                  <SelectItem value="CHILD">Child</SelectItem>
                  <SelectItem value="SIBLING">Sibling</SelectItem>
                  <SelectItem value="FRIEND">Friend</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Priority 1 (Primary)</SelectItem>
                  <SelectItem value="2">Priority 2</SelectItem>
                  <SelectItem value="3">Priority 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewContactModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsNewContactModalOpen(false)}>
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditMedicalInfoModalOpen} onOpenChange={setIsEditMedicalInfoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Medical Information</DialogTitle>
            <DialogDescription>
              Update the resident's medical information and emergency preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="Enter allergies (one per line)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Textarea
                id="conditions"
                placeholder="Enter medical conditions (one per line)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                placeholder="Enter medications (one per line)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional medical notes"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMedicalInfoModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditMedicalInfoModalOpen(false)}>
              Update Information
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


