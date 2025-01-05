/**
 * @writecarenotes.com
 * @fileoverview Medication stock control with mobile-first design
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first stock control component for medication inventory management.
 * Supports offline operations, barcode scanning, and regional compliance.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { BarcodeScanner } from '../BarcodeScanner';
import { useStockControl } from '../../hooks/useStockControl';
import { usePermissions } from '@/hooks/usePermissions';
import type { Medication } from '../../types/medication';
import type { Region } from '@/types/region';

interface StockControlProps {
  medications: Medication[];
  region: Region;
}

export const StockControl: React.FC<StockControlProps> = ({
  medications,
  region,
}) => {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { hasPermission } = usePermissions();
  const {
    stockLevels,
    updateStock,
    recordStockCheck,
    loading,
    error
  } = useStockControl(medications);

  const handleBarcodeScanned = async (barcode: string) => {
    const medication = medications.find(med => med.barcode === barcode);
    if (medication) {
      setSelectedMedication(medication);
      setIsScanning(false);
    }
  };

  const handleStockUpdate = async (medicationId: string, newQuantity: number) => {
    try {
      await updateStock(medicationId, newQuantity);
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (error) {
    return <div className="error-message">{error.message}</div>;
  }

  return (
    <div className="stock-control">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Stock Control</h2>
        {hasPermission('medication.stock.manage') && (
          <Button
            onClick={() => setIsScanning(true)}
            size={isMobile ? 'sm' : 'default'}
          >
            Scan Barcode
          </Button>
        )}
      </div>

      {isScanning && (
        <Card className="mb-4">
          <BarcodeScanner
            onScan={handleBarcodeScanned}
            onClose={() => setIsScanning(false)}
          />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {medications.map(medication => (
          <Card
            key={medication.id}
            className="p-4 stock-card"
            onClick={() => setSelectedMedication(medication)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{medication.name}</h3>
                <p className="text-sm text-gray-600">
                  {medication.form} - {medication.strength}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  Stock: {stockLevels[medication.id] || 0}
                </p>
                {stockLevels[medication.id] <= medication.reorderLevel && (
                  <p className="text-red-500 text-sm">Low Stock</p>
                )}
              </div>
            </div>

            {hasPermission('medication.stock.manage') && (
              <div className="mt-4 flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={stockLevels[medication.id] || 0}
                  onChange={(e) => handleStockUpdate(
                    medication.id,
                    parseInt(e.target.value, 10)
                  )}
                  className="w-24"
                />
                <Button
                  size="sm"
                  onClick={() => recordStockCheck(medication.id)}
                >
                  Record Check
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {isMobile && medications.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Tap a medication to update stock
        </p>
      )}
    </div>
  );
}; 