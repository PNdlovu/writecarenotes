/**
 * @fileoverview Visitor Check-In Component
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Tablet/Kiosk interface for visitor self check-in at care homes
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/UseToast";
import { QRCode } from "@/components/ui/qr-code";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Users, Heart, Briefcase, Tool } from "@/components/ui/icons";
import FamilyVisitorCheckIn from "./FamilyVisitorCheckIn";
import FriendVisitorCheckIn from "./FriendVisitorCheckIn";
import ProfessionalVisitorCheckIn from "./ProfessionalVisitorCheckIn";
import ContractorCheckIn from "./ContractorCheckIn";

interface HealthScreeningQuestions {
  hasSymptoms: boolean;
  hasContact: boolean;
  hasTraveled: boolean;
  hasVaccination: boolean;
}

interface VisitorCheckInProps {
  careHomeId: string;
  kioskId: string;
  onCheckIn?: (visitorId: string) => void;
  onCheckOut?: (visitorId: string) => void;
}

interface VisitorType {
  type: 'family' | 'friend' | 'professional' | 'contractor';
  label: string;
  icon: any;
  component: React.FC;
}

const visitorTypes: VisitorType[] = [
  {
    type: 'family',
    label: 'Family Member',
    icon: Users,
    component: FamilyVisitorCheckIn
  },
  {
    type: 'friend',
    label: 'Friend',
    icon: Heart,
    component: FriendVisitorCheckIn
  },
  {
    type: 'professional',
    label: 'Professional Visit',
    icon: Briefcase,
    component: ProfessionalVisitorCheckIn
  },
  {
    type: 'contractor',
    label: 'Contractor/Maintenance',
    icon: Tool,
    component: ContractorCheckIn
  }
];

export const VisitorCheckIn: React.FC<VisitorCheckInProps> = ({
  careHomeId,
  kioskId,
  onCheckIn,
  onCheckOut,
}) => {
  const [mode, setMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [step, setStep] = useState(1);
  const [visitorCode, setVisitorCode] = useState('');
  const [healthAnswers, setHealthAnswers] = useState<HealthScreeningQuestions>({
    hasSymptoms: false,
    hasContact: false,
    hasTraveled: false,
    hasVaccination: true,
  });
  const [showHealthDialog, setShowHealthDialog] = useState(false);
  const { toast } = useToast();

  const handleCodeSubmit = async () => {
    try {
      // Verify visitor code against scheduled visits
      const response = await fetch('/api/visits/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          visitorCode,
          careHomeId,
          kioskId,
          mode 
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid visitor code');
      }

      if (mode === 'CHECK_IN') {
        setStep(2); // Proceed to health screening
      } else {
        handleCheckOut();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid visitor code. Please try again or seek staff assistance.",
        variant: "destructive",
      });
    }
  };

  const handleHealthScreening = () => {
    if (
      healthAnswers.hasSymptoms ||
      healthAnswers.hasContact ||
      healthAnswers.hasTraveled
    ) {
      setShowHealthDialog(true);
    } else {
      handleCheckIn();
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/visits/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorCode,
          careHomeId,
          kioskId,
          healthScreening: healthAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Check-in failed');
      }

      const { visitorId } = await response.json();
      onCheckIn?.(visitorId);

      toast({
        title: "Welcome!",
        description: "You have been successfully checked in. Please collect your visitor badge.",
      });

      // Reset form
      setStep(1);
      setVisitorCode('');
      setHealthAnswers({
        hasSymptoms: false,
        hasContact: false,
        hasTraveled: false,
        hasVaccination: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Check-in failed. Please seek staff assistance.",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch('/api/visits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorCode,
          careHomeId,
          kioskId,
        }),
      });

      if (!response.ok) {
        throw new Error('Check-out failed');
      }

      const { visitorId } = await response.json();
      onCheckOut?.(visitorId);

      toast({
        title: "Goodbye!",
        description: "You have been successfully checked out. Thank you for visiting.",
      });

      // Reset form
      setVisitorCode('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Check-out failed. Please seek staff assistance.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Visitor {mode === 'CHECK_IN' ? 'Check-In' : 'Check-Out'}</h2>
          <p className="text-muted-foreground">
            {mode === 'CHECK_IN' 
              ? 'Welcome! Please check in for your visit'
              : 'Thank you for visiting. Please check out before leaving'
            }
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant={mode === 'CHECK_IN' ? 'default' : 'outline'}
            onClick={() => setMode('CHECK_IN')}
          >
            Check In
          </Button>
          <Button
            variant={mode === 'CHECK_OUT' ? 'default' : 'outline'}
            onClick={() => setMode('CHECK_OUT')}
          >
            Check Out
          </Button>
        </div>

        <Tabs defaultValue="family">
          <TabsList>
            {visitorTypes.map((type) => (
              <TabsTrigger key={type.type} value={type.type}>
                <div className="flex items-center space-x-2">
                  <type.icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {visitorTypes.map((type) => (
            <TabsContent key={type.type} value={type.type}>
              <type.component />
            </TabsContent>
          ))}
        </Tabs>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Enter Your Visitor Code</Label>
              <Input
                type="text"
                value={visitorCode}
                onChange={(e) => setVisitorCode(e.target.value)}
                placeholder="Enter code from your confirmation email"
                className="text-center text-2xl tracking-wider"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleCodeSubmit}
              disabled={!visitorCode}
            >
              Continue
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={() => toast({
                title: "Need Help?",
                description: "Please ask a staff member for assistance.",
              })}>
                Need Help?
              </Button>
            </div>
          </div>
        )}

        {step === 2 && mode === 'CHECK_IN' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Health Screening</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symptoms"
                  checked={healthAnswers.hasSymptoms}
                  onCheckedChange={(checked) => 
                    setHealthAnswers(prev => ({ ...prev, hasSymptoms: !!checked }))
                  }
                />
                <Label htmlFor="symptoms">
                  Do you have any COVID-19 symptoms?
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact"
                  checked={healthAnswers.hasContact}
                  onCheckedChange={(checked) => 
                    setHealthAnswers(prev => ({ ...prev, hasContact: !!checked }))
                  }
                />
                <Label htmlFor="contact">
                  Have you been in contact with anyone with COVID-19?
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="travel"
                  checked={healthAnswers.hasTraveled}
                  onCheckedChange={(checked) => 
                    setHealthAnswers(prev => ({ ...prev, hasTraveled: !!checked }))
                  }
                />
                <Label htmlFor="travel">
                  Have you traveled internationally in the last 14 days?
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vaccination"
                  checked={healthAnswers.hasVaccination}
                  onCheckedChange={(checked) => 
                    setHealthAnswers(prev => ({ ...prev, hasVaccination: !!checked }))
                  }
                />
                <Label htmlFor="vaccination">
                  Are you up to date with COVID-19 vaccinations?
                </Label>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleHealthScreening}
            >
              Complete Check-In
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showHealthDialog} onOpenChange={setShowHealthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Health Screening Alert</DialogTitle>
            <DialogDescription>
              Based on your responses, we need to take additional precautions.
              Please wait for a staff member to assist you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowHealthDialog(false)}>
              Wait for Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};


