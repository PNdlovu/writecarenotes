// src/features/carehome/components/floorplan/RoomDetails.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface RoomDetailsProps {
  careHomeId: string;
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Resident {
  id: string;
  name: string;
  dateAdmitted: string;
  carePlanStatus: string;
}

interface Maintenance {
  id: string;
  type: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
}

interface RoomData {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite';
  status: 'occupied' | 'available' | 'maintenance';
  residents: Resident[];
  features: string[];
  lastCleaned: string;
  nextCleaning: string;
  maintenanceHistory: Maintenance[];
}

export function RoomDetails({ careHomeId, roomId, isOpen, onClose }: RoomDetailsProps) {
  const { data: room, isLoading } = useQuery<RoomData>({
    queryKey: ['room', careHomeId, roomId],
    queryFn: async () => {
      const response = await fetch(`/api/care-homes/${careHomeId}/rooms/${roomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch room details');
      }
      return response.json();
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Room {room?.number} Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about the room and its occupants
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Loading room details...</div>
        ) : room ? (
          <div className="space-y-6">
            {/* Room Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Room Status</h3>
                <Badge
                  variant={
                    room.status === 'occupied'
                      ? 'destructive'
                      : room.status === 'available'
                      ? 'success'
                      : 'warning'
                  }
                >
                  {room.status}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Room Type</p>
                  <p className="font-medium capitalize">{room.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Features</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {room.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Residents */}
            {room.residents.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserGroupIcon className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">Current Residents</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date Admitted</TableHead>
                      <TableHead>Care Plan Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {room.residents.map((resident) => (
                      <TableRow key={resident.id}>
                        <TableCell>{resident.name}</TableCell>
                        <TableCell>{new Date(resident.dateAdmitted).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{resident.carePlanStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {/* Cleaning Schedule */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Cleaning Schedule</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Last Cleaned</p>
                  <p className="font-medium">
                    {new Date(room.lastCleaned).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Cleaning</p>
                  <p className="font-medium">
                    {new Date(room.nextCleaning).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Maintenance History */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <WrenchScrewdriverIcon className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Maintenance History</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Completed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {room.maintenanceHistory.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>{maintenance.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            maintenance.status === 'completed'
                              ? 'success'
                              : maintenance.status === 'scheduled'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {maintenance.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(maintenance.scheduledDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {maintenance.completedDate
                          ? new Date(maintenance.completedDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Calendar Events */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Upcoming Events</h3>
              </div>
              {/* Add calendar integration here */}
            </Card>
          </div>
        ) : (
          <div>Failed to load room details</div>
        )}
      </DialogContent>
    </Dialog>
  );
}


