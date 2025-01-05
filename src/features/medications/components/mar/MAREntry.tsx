/**
 * @writecarenotes.com
 * @fileoverview MAR Entry Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for recording individual medication administration entries,
 * including dose given, time, and signature capture.
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/select';
import { useMAR } from '../../hooks/useMAR';
import { MARSignature } from './MARSignature';
import type { MAREntry as MAREntryType } from '../../types/mar';

interface Props {
  medicationId: string;
  scheduledTime: string;
  onComplete?: () => void;
}

export function MAREntry({ medicationId, scheduledTime, onComplete }: Props) {
  const [showSignature, setShowSignature] = useState(false);
  const [entry, setEntry] = useState<Partial<MAREntryType>>({
    medicationId,
    scheduledTime,
    status: 'PENDING'
  });

  const { recordEntry, isLoading } = useMAR();

  const handleInputChange = (field: keyof MAREntryType, value: string) => {
    setEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (signature: string) => {
    try {
      await recordEntry({
        ...entry,
        signature,
        administeredTime: new Date().toISOString()
      } as MAREntryType);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to record MAR entry:', error);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">
            {format(new Date(scheduledTime), 'HH:mm')}
          </h3>
          <Select
            value={entry.status}
            onValueChange={value => handleInputChange('status', value)}
          >
            <option value="GIVEN">Given</option>
            <option value="REFUSED">Refused</option>
            <option value="OMITTED">Omitted</option>
          </Select>
        </div>

        {entry.status === 'GIVEN' && (
          <>
            <div>
              <label className="text-sm font-medium">Dose Given</label>
              <Input
                type="text"
                value={entry.doseGiven}
                onChange={e => handleInputChange('doseGiven', e.target.value)}
                placeholder="Enter dose given"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                type="text"
                value={entry.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Add any notes"
              />
            </div>
          </>
        )}

        {entry.status === 'REFUSED' && (
          <div>
            <label className="text-sm font-medium">Reason for Refusal</label>
            <Input
              type="text"
              value={entry.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Enter reason"
            />
          </div>
        )}

        {entry.status === 'OMITTED' && (
          <div>
            <label className="text-sm font-medium">Reason for Omission</label>
            <Input
              type="text"
              value={entry.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Enter reason"
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => setShowSignature(true)}
            disabled={isLoading}
          >
            Sign & Complete
          </Button>
        </div>

        {showSignature && (
          <MARSignature
            onSign={handleSubmit}
            onCancel={() => setShowSignature(false)}
          />
        )}
      </div>
    </Card>
  );
} 