/**
 * @writecarenotes.com
 * @fileoverview Automated reorder component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for managing automated medication reordering
 * including reorder rules and purchase orders.
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { useOrganization } from '@/hooks/useOrganization';
import { ReorderService } from '../../services/reorderService';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  RefreshCcw,
  XCircle,
} from 'lucide-react';
import type { PurchaseOrder } from '../../types/stockAnalytics';

const reorderService = new ReorderService();

export function AutomatedReorder() {
  const { organizationId } = useOrganization();
  const [activeTab, setActiveTab] = useState('orders');

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['purchase-orders', organizationId],
    queryFn: () => reorderService.getPurchaseOrders(organizationId),
  });

  const { mutate: checkAndCreateOrders } = useMutation({
    mutationFn: () => reorderService.checkAndCreateOrders(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      toast({
        title: 'Orders checked',
        description: 'New purchase orders have been created for low stock items.',
      });
    },
  });

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: PurchaseOrder['status'];
    }) => reorderService.updatePurchaseOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      toast({
        title: 'Order updated',
        description: 'The purchase order status has been updated.',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        <p>Error loading orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Automated Reordering
        </h2>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => checkAndCreateOrders()}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Check Stock Levels
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Orders in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                orders.filter(
                  (o) =>
                    o.status === 'APPROVED' || o.status === 'ORDERED'
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                orders.reduce((sum, o) => sum + o.totalCost, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All active orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === 'RECEIVED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            Manage and track medication purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="orders">Active Orders</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter(
                      (o) =>
                        o.status !== 'RECEIVED' &&
                        o.status !== 'CANCELLED'
                    )
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          {order.items.length} items
                        </TableCell>
                        <TableCell>
                          {formatCurrency(order.totalCost)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {order.status === 'DRAFT' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus({
                                      id: order.id,
                                      status: 'PENDING',
                                    })
                                  }
                                >
                                  Submit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    updateOrderStatus({
                                      id: order.id,
                                      status: 'CANCELLED',
                                    })
                                  }
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {order.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus({
                                      id: order.id,
                                      status: 'APPROVED',
                                    })
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    updateOrderStatus({
                                      id: order.id,
                                      status: 'CANCELLED',
                                    })
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {order.status === 'APPROVED' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus({
                                    id: order.id,
                                    status: 'ORDERED',
                                  })
                                }
                              >
                                Mark as Ordered
                              </Button>
                            )}
                            {order.status === 'ORDERED' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus({
                                    id: order.id,
                                    status: 'RECEIVED',
                                  })
                                }
                              >
                                Receive Order
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="completed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter((o) => o.status === 'RECEIVED')
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          {order.items.length} items
                        </TableCell>
                        <TableCell>
                          {formatCurrency(order.totalCost)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="cancelled">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Cancelled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter((o) => o.status === 'CANCELLED')
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          {order.items.length} items
                        </TableCell>
                        <TableCell>
                          {formatCurrency(order.totalCost)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: PurchaseOrder['status'] }) {
  switch (status) {
    case 'DRAFT':
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Draft
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case 'ORDERED':
      return (
        <Badge variant="info" className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          Ordered
        </Badge>
      );
    case 'RECEIVED':
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Received
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
} 