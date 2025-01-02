/**
 * @writecarenotes.com
 * @fileoverview Medication Details Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying detailed medication information including
 * prescription details, administration instructions, and history.
 */

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useMedications } from '../hooks/useMedications';
import type { Medication } from '../types';

interface Props {
  medicationId: string;
}

export function MedicationDetails({ medicationId }: Props) {
  const { medication, isLoading, error } = useMedications(medicationId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading medication details</div>;
  }

  if (!medication) {
    return <div>Medication not found</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">{medication.name}</h2>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="space-y-4">
            <div>
              <label className="font-medium">Generic Name</label>
              <p>{medication.genericName}</p>
            </div>
            <div>
              <label className="font-medium">Form</label>
              <p>{medication.form}</p>
            </div>
            <div>
              <label className="font-medium">Strength</label>
              <p>{medication.strength}</p>
            </div>
            <div>
              <label className="font-medium">Route</label>
              <p>{medication.route}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="instructions">
          {medication.instructions && (
            <div className="space-y-4">
              <div>
                <label className="font-medium">Administration</label>
                <p>{medication.instructions.administration}</p>
              </div>
              {medication.instructions.special && (
                <div>
                  <label className="font-medium">Special Instructions</label>
                  <p>{medication.instructions.special}</p>
                </div>
              )}
              {medication.instructions.warnings && (
                <div>
                  <label className="font-medium">Warnings</label>
                  <ul className="list-disc pl-4">
                    {medication.instructions.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="history">
          {medication.history && (
            <div className="space-y-4">
              {medication.history.map((entry) => (
                <div key={entry.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{entry.type}</span>
                    <span className="text-gray-500">{entry.date}</span>
                  </div>
                  <p>{entry.details}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
} 