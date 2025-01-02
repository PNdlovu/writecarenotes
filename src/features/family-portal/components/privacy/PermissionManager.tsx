/**
 * @fileoverview Permission Manager Component
 * Manages granular permissions and access controls
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { usePermissions } from '../../hooks/usePermissions';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

interface PermissionManagerProps {
  residentId: string;
  familyMemberId: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'personal' | 'financial' | 'communication';
  level: 'read' | 'write' | 'admin';
  granted: boolean;
  grantedTo: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  conditions?: Array<{
    type: 'time' | 'location' | 'role' | 'purpose';
    value: string;
  }>;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [category, setCategory] = useState<Permission['category']>('medical');

  const {
    permissions,
    isLoading,
    grantPermission,
    revokePermission,
    updatePermission,
  } = usePermissions({ residentId, familyMemberId });

  const handleGrantPermission = async (permission: Omit<Permission, 'id'>) => {
    await grantPermission(permission);
    setShowGrantDialog(false);
  };

  const handleRevokePermission = async (id: string) => {
    await revokePermission(id);
  };

  const getFilteredPermissions = () => {
    return permissions.filter(p => p.category === category);
  };

  const renderPermissionLevel = (level: Permission['level']) => {
    const variants = {
      read: 'secondary',
      write: 'default',
      admin: 'destructive',
    };

    return (
      <Badge variant={variants[level]}>
        {level}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Permission Manager</h2>
          <p className="text-muted-foreground">
            Manage access permissions and privacy controls
          </p>
        </div>
        <Button onClick={() => setShowGrantDialog(true)}>
          Grant Permission
        </Button>
      </div>

      <Tabs defaultValue="medical" className="space-y-4">
        <TabsList>
          <TabsTrigger
            value="medical"
            onClick={() => setCategory('medical')}
          >
            Medical
          </TabsTrigger>
          <TabsTrigger
            value="personal"
            onClick={() => setCategory('personal')}
          >
            Personal
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            onClick={() => setCategory('financial')}
          >
            Financial
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            onClick={() => setCategory('communication')}
          >
            Communication
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {getFilteredPermissions().map((permission) => (
              <Card
                key={permission.id}
                className="p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{permission.name}</h4>
                      {renderPermissionLevel(permission.level)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {permission.description}
                    </p>
                    {permission.conditions && permission.conditions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Conditions:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {permission.conditions.map((condition, index) => (
                            <Badge key={index} variant="outline">
                              {condition.type}: {condition.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={permission.granted}
                      onCheckedChange={() =>
                        permission.granted
                          ? handleRevokePermission(permission.id)
                          : handleGrantPermission({
                              ...permission,
                              granted: true,
                              grantedAt: new Date(),
                            })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPermission(permission.id)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
                {permission.grantedTo.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Granted to:</p>
                    <div className="mt-2 space-y-2">
                      {permission.grantedTo.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <span className="font-medium">{user.name}</span>
                            <span className="text-muted-foreground"> • {user.role}</span>
                          </div>
                          <span className="text-muted-foreground">{user.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Tabs>

      {/* Grant Permission Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Grant Permission</DialogTitle>
            <DialogDescription>
              Grant access permission to a user or role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Access Level</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Duration</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Conditions</label>
              {/* Add condition builder component */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleGrantPermission}>
              Grant Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Details Dialog */}
      <Dialog
        open={selectedPermission !== null}
        onOpenChange={() => setSelectedPermission(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          {selectedPermission && (
            <div>
              {/* Permission details content */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};


