import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/form/switch";
import { Label } from "@/components/ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/form/radio-group";
import { Separator } from "@/components/ui/separator";

interface PreferencesManagerProps {
  residentId: string;
  familyMemberId: string;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  categories: {
    medications: boolean;
    appointments: boolean;
    activities: boolean;
    documents: boolean;
    emergencies: boolean;
  };
}

interface PrivacySettings {
  shareHealthInfo: boolean;
  shareActivities: boolean;
  shareDocuments: boolean;
  allowPhotos: boolean;
  visitorLog: boolean;
}

interface CommunicationPreferences {
  preferredLanguage: string;
  preferredContactTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'SMS';
  doNotDisturb: boolean;
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
}

export const PreferencesManager: React.FC<PreferencesManagerProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [isEditNotificationsOpen, setIsEditNotificationsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock data - would be replaced with actual API calls
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    frequency: 'IMMEDIATE',
    categories: {
      medications: true,
      appointments: true,
      activities: true,
      documents: false,
      emergencies: true,
    },
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareHealthInfo: true,
    shareActivities: true,
    shareDocuments: true,
    allowPhotos: false,
    visitorLog: true,
  });

  const [communicationPrefs, setCommunicationPrefs] = useState<CommunicationPreferences>({
    preferredLanguage: 'en',
    preferredContactTime: 'MORNING',
    preferredContactMethod: 'EMAIL',
    doNotDisturb: false,
  });

  const handleSave = () => {
    // Handle saving preferences
    setHasUnsavedChanges(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Preferences</h2>
          <p className="text-muted-foreground">
            Manage your notification, privacy, and communication preferences
          </p>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSave}>
            <Icons.save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notification Preferences */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold tracking-tight">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditNotificationsOpen(true)}
              >
                <Icons.edit className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="text-sm">
                      Email Notifications
                    </Label>
                    <Switch
                      id="email-notifications"
                      checked={notificationPrefs.email}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs((prev) => ({ ...prev, email: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications" className="text-sm">
                      SMS Notifications
                    </Label>
                    <Switch
                      id="sms-notifications"
                      checked={notificationPrefs.sms}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs((prev) => ({ ...prev, sms: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications" className="text-sm">
                      Push Notifications
                    </Label>
                    <Switch
                      id="push-notifications"
                      checked={notificationPrefs.push}
                      onCheckedChange={(checked) => {
                        setNotificationPrefs((prev) => ({ ...prev, push: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Notification Categories</Label>
                <div className="space-y-2">
                  {Object.entries(notificationPrefs.categories).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`category-${key}`} className="text-sm capitalize">
                        {key}
                      </Label>
                      <Switch
                        id={`category-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => {
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            categories: {
                              ...prev.categories,
                              [key]: checked,
                            },
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight">Privacy</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                {Object.entries(privacySettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`privacy-${key}`} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                    <Switch
                      id={`privacy-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => {
                        setPrivacySettings((prev) => ({
                          ...prev,
                          [key]: checked,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Communication Preferences */}
        <Card className="p-6 md:col-span-2">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight">Communication</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select
                    value={communicationPrefs.preferredLanguage}
                    onValueChange={(value) => {
                      setCommunicationPrefs((prev) => ({
                        ...prev,
                        preferredLanguage: value,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Contact Time</Label>
                  <RadioGroup
                    value={communicationPrefs.preferredContactTime}
                    onValueChange={(value: 'MORNING' | 'AFTERNOON' | 'EVENING') => {
                      setCommunicationPrefs((prev) => ({
                        ...prev,
                        preferredContactTime: value,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MORNING" id="morning" />
                      <Label htmlFor="morning">Morning</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="AFTERNOON" id="afternoon" />
                      <Label htmlFor="afternoon">Afternoon</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="EVENING" id="evening" />
                      <Label htmlFor="evening">Evening</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Contact Method</Label>
                  <RadioGroup
                    value={communicationPrefs.preferredContactMethod}
                    onValueChange={(value: 'EMAIL' | 'PHONE' | 'SMS') => {
                      setCommunicationPrefs((prev) => ({
                        ...prev,
                        preferredContactMethod: value,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="EMAIL" id="email" />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PHONE" id="phone" />
                      <Label htmlFor="phone">Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SMS" id="sms" />
                      <Label htmlFor="sms">SMS</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="do-not-disturb">Do Not Disturb</Label>
                    <Switch
                      id="do-not-disturb"
                      checked={communicationPrefs.doNotDisturb}
                      onCheckedChange={(checked) => {
                        setCommunicationPrefs((prev) => ({
                          ...prev,
                          doNotDisturb: checked,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  {communicationPrefs.doNotDisturb && (
                    <Alert>
                      <Icons.alertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Non-emergency notifications will be muted during Do Not Disturb hours.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Notifications Dialog */}
      <Dialog open={isEditNotificationsOpen} onOpenChange={setIsEditNotificationsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notification Settings</DialogTitle>
            <DialogDescription>
              Configure how and when you receive notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select
                value={notificationPrefs.frequency}
                onValueChange={(value: 'IMMEDIATE' | 'DAILY' | 'WEEKLY') => {
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    frequency: value,
                  }));
                  setHasUnsavedChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                  <SelectItem value="DAILY">Daily Digest</SelectItem>
                  <SelectItem value="WEEKLY">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="categories">
                <AccordionTrigger>Notification Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {Object.entries(notificationPrefs.categories).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`dialog-category-${key}`} className="text-sm capitalize">
                          {key}
                        </Label>
                        <Switch
                          id={`dialog-category-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => {
                            setNotificationPrefs((prev) => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                [key]: checked,
                              },
                            }));
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditNotificationsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditNotificationsOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


