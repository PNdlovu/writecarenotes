/**
 * @writecarenotes.com
 * @fileoverview Expiring stock component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying medications approaching their expiry date,
 * with sorting and filtering capabilities.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { format, differenceInDays } from 'date-fns';
import { AlertTriangle, Download } from 'lucide-react';
import { ExportService } from '../../services/exportService';
import type { StockLevel } from '../../types';

interface ExpiringStockProps {
  stock: StockLevel[];
  isLoading: boolean;
}

const exportService = new ExportService();

export function ExpiringStock({ stock, isLoading }: ExpiringStockProps) {
  const getExpiryStatus = (expiryDate: Date) => {
    const daysToExpiry = differenceInDays(new Date(expiryDate), new Date());
    if (daysToExpiry <= 30) return 'critical';
    if (daysToExpiry <= 60) return 'warning';
    return 'info';
  };

  const statusColors = {
    critical: 'destructive',
    warning: 'warning',
    info: 'secondary'
  };

  const handleExport = () => {
    exportService.exportExpiringStock(stock);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading expiring stock...</p>
      </div>
    );
  }

  const sortedStock = [...stock].sort((a, b) => {
    if (!a.expiryDate || !b.expiryDate) return 0;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Expiring Stock</h3>
          <p className="text-sm text-muted-foreground">
            Medications approaching their expiry date
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={sortedStock.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication ID</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Until Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No expiring stock found</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedStock.map((item) => {
                if (!item.expiryDate) return null;
                
                const daysToExpiry = differenceInDays(
                  new Date(item.expiryDate),
                  new Date()
                );
                const status = getExpiryStatus(item.expiryDate);

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.medicationId}</TableCell>
                    <TableCell>{item.batchNumber || '-'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(item.expiryDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertTriangle 
                          className={`h-4 w-4 ${
                            status === 'critical' ? 'text-destructive' :
                            status === 'warning' ? 'text-warning' :
                            'text-muted-foreground'
                          }`}
                        />
                        {daysToExpiry} days
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[status]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 