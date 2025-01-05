/**
 * @writecarenotes.com
 * @fileoverview Stock management interface component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main interface for medication stock management, providing stock level overview,
 * alerts, and quick actions for stock control.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStock } from '../../hooks/useStock';
import { StockReceipt } from './StockReceipt';
import { StockAdjustment } from './StockAdjustment';
import { TransactionHistory } from './TransactionHistory';
import { ExpiringStock } from './ExpiringStock';
import { 
  AlertTriangle,
  Package,
  History,
  Calendar,
  Plus,
  MinusCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface StockManagementProps {
  medicationId: string;
}

export function StockManagement({ medicationId }: StockManagementProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  const {
    stockLevel,
    transactions,
    expiringStock,
    isLoadingStock,
    isLoadingTransactions,
    isLoadingExpiring
  } = useStock(medicationId);

  const getStockStatus = () => {
    if (!stockLevel) return 'unknown';
    if (stockLevel.quantity <= stockLevel.criticalLevel) return 'critical';
    if (stockLevel.quantity <= stockLevel.reorderLevel) return 'low';
    return 'normal';
  };

  const stockStatus = getStockStatus();
  const statusColors = {
    critical: 'destructive',
    low: 'warning',
    normal: 'success',
    unknown: 'secondary'
  };

  return (
    <div className="space-y-6">
      {/* Stock Overview Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Stock Management</h2>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[stockStatus]}>
                {stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}
              </Badge>
              {stockLevel?.expiryDate && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Expires: {format(new Date(stockLevel.expiryDate), 'dd MMM yyyy')}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReceiptOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Receipt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdjustmentOpen(true)}
            >
              <MinusCircle className="h-4 w-4 mr-2" />
              Adjustment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Current Stock</h3>
            </div>
            <p className="text-2xl font-bold">
              {isLoadingStock ? '...' : stockLevel?.quantity || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Batch: {stockLevel?.batchNumber || 'N/A'}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Reorder Level</h3>
            </div>
            <p className="text-2xl font-bold">
              {isLoadingStock ? '...' : stockLevel?.reorderLevel || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Critical: {stockLevel?.criticalLevel || 0}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Last Updated</h3>
            </div>
            <p className="text-2xl font-bold">
              {isLoadingStock ? '...' : 
                format(new Date(stockLevel?.lastUpdated || Date.now()), 'HH:mm')}
            </p>
            <p className="text-sm text-muted-foreground">
              {isLoadingStock ? '...' : 
                format(new Date(stockLevel?.lastUpdated || Date.now()), 'dd MMM yyyy')}
            </p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <TransactionHistory 
              transactions={transactions || []}
              isLoading={isLoadingTransactions}
            />
          </TabsContent>

          <TabsContent value="expiring">
            <ExpiringStock 
              stock={expiringStock || []}
              isLoading={isLoadingExpiring}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Stock Receipt Dialog */}
      <StockReceipt
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        medicationId={medicationId}
      />

      {/* Stock Adjustment Dialog */}
      <StockAdjustment
        open={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        medicationId={medicationId}
      />
    </div>
  );
} 