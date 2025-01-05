/**
 * @writecarenotes.com
 * @fileoverview Mobile-first eMAR Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first electronic Medication Administration Record (eMAR) component
 * with offline support and responsive design for all device sizes.
 */

import React, { useEffect, useState } from 'react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useSwipe } from '@/hooks/useSwipe';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/ui/icons';
import { MAREntry } from './MAREntry';
import { MARSignature } from './MARSignature';
import { MARHistory } from './MARHistory';
import type { MedicationSchedule, MARRecord } from '@/types/mar';

interface Props {
  resident: {
    id: string;
    name: string;
    room: string;
    dateOfBirth: string;
    allergies: string[];
  };
  medications: MedicationSchedule[];
  onAdminister: (record: MARRecord) => Promise<void>;
}

export function MedicationAdministrationRecord({ resident, medications, onAdminister }: Props) {
  // Offline support
  const { saveOffline, getOfflineData } = useOfflineStorage();
  const { isOnline, syncStatus } = useSyncStatus();
  
  // Mobile gestures
  const { swipeHandlers } = useSwipe();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMedication, setSelectedMedication] = useState<MedicationSchedule | null>(null);
  const [offlineRecords, setOfflineRecords] = useState<MARRecord[]>([]);

  // Load offline data
  useEffect(() => {
    const loadOfflineData = async () => {
      const data = await getOfflineData(`mar_${resident.id}`);
      if (data) setOfflineRecords(data);
    };
    loadOfflineData();
  }, [resident.id, getOfflineData]);

  // Handle administration
  const handleAdminister = async (record: MARRecord) => {
    try {
      if (isOnline) {
        await onAdminister(record);
      } else {
        await saveOffline(`mar_${resident.id}`, [...offlineRecords, record]);
        setOfflineRecords(prev => [...prev, record]);
      }
    } catch (error) {
      console.error('Failed to record administration:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4" {...swipeHandlers}>
      {/* Resident Info - Mobile Optimized */}
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            {resident.name}
            <Badge variant={isOnline ? "success" : "warning"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <div>Room: {resident.room}</div>
          <div>DOB: {format(new Date(resident.dateOfBirth), 'dd/MM/yyyy')}</div>
          <div className="col-span-2">
            <span className="font-semibold text-red-500">Allergies: </span>
            {resident.allergies.join(', ')}
          </div>
        </CardContent>
      </Card>

      {/* Date Navigation - Touch Friendly */}
      <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}
        >
          <Icons.chevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold">
          {format(currentDate, 'dd MMMM yyyy')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
        >
          <Icons.chevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Medications List - Responsive */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-2">
          {medications.map(med => (
            <Card 
              key={med.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedMedication(med)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{med.name}</h3>
                    <p className="text-sm text-gray-600">
                      {med.dose} - {med.route}
                    </p>
                  </div>
                  <Badge variant={med.status === 'DUE' ? 'default' : 'secondary'}>
                    {med.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Next due: {format(new Date(med.nextDue), 'HH:mm')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Administration Dialog - Touch Optimized */}
      {selectedMedication && (
        <MAREntry
          medication={selectedMedication}
          onAdminister={handleAdminister}
          onClose={() => setSelectedMedication(null)}
          isOffline={!isOnline}
        />
      )}

      {/* Sync Status */}
      {!isOnline && offlineRecords.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <Badge variant="warning" className="animate-pulse">
            {offlineRecords.length} records pending sync
          </Badge>
        </div>
      )}
    </div>
  );
}


