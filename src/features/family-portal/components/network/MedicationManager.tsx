import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/form/textarea";

interface MedicationManagerProps {
  residentId: string;
}

export const MedicationManager: React.FC<MedicationManagerProps> = ({
  residentId,
}) => {
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Medication Management</h3>
        <Button onClick={() => setIsAddMedicationOpen(true)}>
          Add Medication
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Active Medications */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Active Medications</h4>
          <div className="space-y-4">
            {/* Mock medication - replace with actual data */}
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold">Lisinopril</h5>
                  <p className="text-sm text-muted-foreground">10mg - Once daily</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="mt-2">
                <p className="text-sm"><strong>Next dose:</strong> Today 8:00 PM</p>
                <p className="text-sm"><strong>Refill due:</strong> in 10 days</p>
              </div>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm">View Details</Button>
                <Button variant="outline" size="sm">Mark Taken</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Medication History */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Recent Updates</h4>
          <div className="space-y-4">
            {/* Mock history - replace with actual data */}
            <div className="border rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Today 9:00 AM</p>
              <p className="font-medium">Morning medication taken</p>
              <Badge variant="outline" className="mt-1">Recorded by Jane</Badge>
            </div>
          </div>
        </Card>

        {/* Interactions & Warnings */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Interactions & Warnings</h4>
          <div className="space-y-4">
            {/* Mock warning - replace with actual data */}
            <div className="border rounded-lg p-3 border-yellow-200 bg-yellow-50">
              <h5 className="font-semibold text-yellow-800">Moderate Interaction</h5>
              <p className="text-sm text-yellow-700">
                Potential interaction between Lisinopril and Potassium supplements
              </p>
            </div>
          </div>
        </Card>

        {/* Side Effects Monitoring */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Side Effects Monitoring</h4>
          <div className="space-y-4">
            <Button className="w-full">
              Report New Side Effect
            </Button>
            {/* Mock side effect - replace with actual data */}
            <div className="border rounded-lg p-3">
              <p className="font-medium">Reported: Mild dizziness</p>
              <p className="text-sm text-muted-foreground">2 days ago</p>
              <Badge variant="outline" className="mt-1">Being monitored</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isAddMedicationOpen} onOpenChange={setIsAddMedicationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter the details of the new medication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="med-name">Medication Name</Label>
              <Input id="med-name" />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input id="frequency" placeholder="e.g., Once daily" />
            </div>
            <div>
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea id="instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMedicationOpen(false)}>
              Cancel
            </Button>
            <Button>Add Medication</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


