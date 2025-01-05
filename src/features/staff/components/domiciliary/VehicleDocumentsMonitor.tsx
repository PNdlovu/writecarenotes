'use client';

/**
 * @writecarenotes.com
 * @fileoverview Component for monitoring vehicle documents expiry
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';

interface Staff {
  id: string;
  User: {
    firstName: string;
    lastName: string;
  };
  vehicleDetails: {
    make?: string;
    model?: string;
    registration?: string;
    insurance?: {
      provider: string;
      policyNumber: string;
      expiryDate: string;
      businessUseIncluded: boolean;
    };
  };
}

interface Props {
  organizationId: string;
  onRefresh?: () => void;
}

export function VehicleDocumentsMonitor({ organizationId, onRefresh }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [daysThreshold, setDaysThreshold] = useState(30);
  const { showToast } = useToast();

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/staff/domiciliary?type=expiring-vehicle-docs&daysThreshold=${daysThreshold}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      showToast('error', 'Failed to fetch staff data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [daysThreshold]);

  const getExpiryStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days <= 7) return 'critical';
    if (days <= 14) return 'warning';
    return 'info';
  };

  const handleRefresh = () => {
    fetchStaff();
    onRefresh?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vehicle Documents Monitor</CardTitle>
          <div className="flex items-center gap-4">
            <Select
              options={[
                { value: '7', label: '7 days' },
                { value: '14', label: '14 days' },
                { value: '30', label: '30 days' },
                { value: '60', label: '60 days' },
                { value: '90', label: '90 days' }
              ]}
              value={daysThreshold.toString()}
              onChange={(value) => setDaysThreshold(parseInt(value))}
              className="w-32"
            />
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Insurance Provider</TableHead>
              <TableHead>Policy Number</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Business Use</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  {member.User.firstName} {member.User.lastName}
                </TableCell>
                <TableCell>
                  {member.vehicleDetails.make} {member.vehicleDetails.model}
                  <br />
                  <span className="text-sm text-gray-500">
                    {member.vehicleDetails.registration}
                  </span>
                </TableCell>
                <TableCell>
                  {member.vehicleDetails.insurance?.provider}
                </TableCell>
                <TableCell>
                  {member.vehicleDetails.insurance?.policyNumber}
                </TableCell>
                <TableCell>
                  {format(
                    new Date(member.vehicleDetails.insurance?.expiryDate || ''),
                    'dd MMM yyyy'
                  )}
                </TableCell>
                <TableCell>
                  {member.vehicleDetails.insurance?.businessUseIncluded ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <Badge variant="error">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getExpiryStatus(
                      member.vehicleDetails.insurance?.expiryDate || ''
                    )}
                  >
                    {differenceInDays(
                      new Date(member.vehicleDetails.insurance?.expiryDate || ''),
                      new Date()
                    )}{' '}
                    days
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No staff members with expiring vehicle documents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 