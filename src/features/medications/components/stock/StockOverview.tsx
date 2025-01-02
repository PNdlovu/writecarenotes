/**
 * @writecarenotes.com
 * @fileoverview Stock overview component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying an overview of medication stock
 * including alerts, levels, and quick actions.
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStock } from '../../hooks/useStock';
import { AlertTriangle, AlertCircle, Clock, Plus } from 'lucide-react';
import type { MedicationStock } from '../../types/stock';

interface StockOverviewProps {
  medicationId: string;
  onAddStock?: () => void;
  onAddTransaction?: () => void;
}

export function StockOverview({
  medicationId,
  onAddStock,
  onAddTransaction,
}: StockOverviewProps) {
  const [activeTab, setActiveTab] = useState('current');
  const {
    useStockByMedication,
    getStockLevelStatus,
    getStockAlerts,
  } = useStock();

  const {
    data: stockItems,
    isLoading,
    error,
  } = useStockByMedication(medicationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading stock information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <p>Error loading stock information</p>
        </div>
      </div>
    );
  }

  const totalQuantity = stockItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const alerts = stockItems?.flatMap(item => getStockAlerts(item)) || [];
  const criticalAlerts = alerts.filter(alert => alert.level === 'ERROR');
  const warningAlerts = alerts.filter(alert => alert.level === 'WARNING');

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Across {stockItems?.length || 0} batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold">{criticalAlerts.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-2xl font-bold">{warningAlerts.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
          onClick={onAddTransaction}
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Transaction
        </Button>
        <Button onClick={onAddStock}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {/* Stock Details */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
          <CardDescription>
            View and manage medication stock by batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="current">Current Stock</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {stockItems?.map((item) => (
                <StockBatchCard key={item.id} stock={item} />
              ))}

              {stockItems?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No stock found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={onAddStock}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stock
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    alert.level === 'ERROR'
                      ? 'bg-destructive/10 border-destructive/20'
                      : 'bg-warning/10 border-warning/20'
                  }`}
                >
                  {alert.level === 'ERROR' ? (
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {alert.type === 'LOW_STOCK' && 'Low Stock'}
                      {alert.type === 'CRITICAL_STOCK' && 'Critical Stock'}
                      {alert.type === 'EXPIRING_SOON' && 'Expiring Soon'}
                      {alert.type === 'EXPIRED' && 'Expired'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>
                    <div className="mt-1 text-xs">
                      Batch: {alert.batchNumber}
                    </div>
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No alerts found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface StockBatchCardProps {
  stock: MedicationStock;
}

function StockBatchCard({ stock }: StockBatchCardProps) {
  const { getStockLevelStatus } = useStock();
  const status = getStockLevelStatus(stock);

  const expiryDate = new Date(stock.expiryDate);
  const daysToExpiry = Math.ceil(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">Batch {stock.batchNumber}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  status.status === 'CRITICAL'
                    ? 'destructive'
                    : status.status === 'LOW'
                    ? 'warning'
                    : 'secondary'
                }
              >
                {status.status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysToExpiry > 0
                  ? `Expires in ${daysToExpiry} days`
                  : 'Expired'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stock.quantity}</div>
            <p className="text-xs text-muted-foreground">
              Units in stock
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Stock Level</span>
            <span className="text-muted-foreground">
              {stock.quantity} / {Math.max(stock.reorderLevel, stock.quantity)}
            </span>
          </div>
          <Progress
            value={(stock.quantity / Math.max(stock.reorderLevel, stock.quantity)) * 100}
            className={
              status.status === 'CRITICAL'
                ? 'bg-destructive/20'
                : status.status === 'LOW'
                ? 'bg-warning/20'
                : undefined
            }
            indicatorClassName={
              status.status === 'CRITICAL'
                ? 'bg-destructive'
                : status.status === 'LOW'
                ? 'bg-warning'
                : undefined
            }
          />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              Reorder Level: {stock.reorderLevel}
            </div>
            <div>
              Critical Level: {stock.criticalLevel}
            </div>
          </div>
        </div>

        {stock.location && (
          <div className="mt-4 text-sm">
            <span className="font-medium">Location: </span>
            {stock.location}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 