/**
 * @writecarenotes.com
 * @fileoverview Stock transfer component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for managing medication stock transfers
 * between different locations within a care home.
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
import { TransferService } from '../../services/transferService';
import { formatDate } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  Truck,
  XCircle,
} from 'lucide-react';
import type { StockTransfer } from '../../types/stockAnalytics';

const transferService = new TransferService();

export function StockTransfer() {
  const { organizationId } = useOrganization();
  const [activeTab, setActiveTab] = useState('active');

  const {
    data: transfers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['stock-transfers', organizationId],
    queryFn: () => transferService.getTransfers(organizationId),
  });

  const { mutate: updateTransferStatus } = useMutation({
    mutationFn: ({
      id,
      status,
      completedById,
    }: {
      id: string;
      status: StockTransfer['status'];
      completedById?: string;
    }) => transferService.updateTransferStatus(id, status, completedById),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-transfers']);
      toast({
        title: 'Transfer updated',
        description: 'The stock transfer status has been updated.',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading transfers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        <p>Error loading transfers</p>
      </div>
    );
  }

  const pendingTransfers = transfers.filter(
    (t) => t.status === 'PENDING' || t.status === 'IN_TRANSIT'
  );
  const completedTransfers = transfers.filter((t) => t.status === 'COMPLETED');
  const cancelledTransfers = transfers.filter((t) => t.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Stock Transfer</h2>
        <div className="flex items-center gap-4">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transfers.filter((t) => t.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transfers.filter((t) => t.status === 'IN_TRANSIT').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently moving
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                transfers.filter(
                  (t) =>
                    t.status === 'COMPLETED' &&
                    new Date(t.updatedAt).toDateString() ===
                      new Date().toDateString()
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully transferred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transfers.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Transfers List */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Management</CardTitle>
          <CardDescription>
            Manage and track stock transfers between locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">Active Transfers</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Initiated By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">
                        {transfer.id}
                      </TableCell>
                      <TableCell>
                        <TransferStatusBadge status={transfer.status} />
                      </TableCell>
                      <TableCell>{transfer.fromLocation}</TableCell>
                      <TableCell>{transfer.toLocation}</TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        {transfer.initiatedByUser.name}
                      </TableCell>
                      <TableCell>{formatDate(transfer.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transfer.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateTransferStatus({
                                    id: transfer.id,
                                    status: 'IN_TRANSIT',
                                  })
                                }
                              >
                                Start Transfer
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateTransferStatus({
                                    id: transfer.id,
                                    status: 'CANCELLED',
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {transfer.status === 'IN_TRANSIT' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransferStatus({
                                  id: transfer.id,
                                  status: 'COMPLETED',
                                  completedById: 'current-user-id', // TODO: Get from auth
                                })
                              }
                            >
                              Complete Transfer
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
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Initiated By</TableHead>
                    <TableHead>Completed By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">
                        {transfer.id}
                      </TableCell>
                      <TableCell>{transfer.fromLocation}</TableCell>
                      <TableCell>{transfer.toLocation}</TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        {transfer.initiatedByUser.name}
                      </TableCell>
                      <TableCell>
                        {transfer.completedByUser?.name}
                      </TableCell>
                      <TableCell>{formatDate(transfer.createdAt)}</TableCell>
                      <TableCell>{formatDate(transfer.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="cancelled">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Initiated By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Cancelled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancelledTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">
                        {transfer.id}
                      </TableCell>
                      <TableCell>{transfer.fromLocation}</TableCell>
                      <TableCell>{transfer.toLocation}</TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        {transfer.initiatedByUser.name}
                      </TableCell>
                      <TableCell>{formatDate(transfer.createdAt)}</TableCell>
                      <TableCell>{formatDate(transfer.updatedAt)}</TableCell>
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

function TransferStatusBadge({
  status,
}: {
  status: StockTransfer['status'];
}) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'IN_TRANSIT':
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Truck className="h-3 w-3" />
          In Transit
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
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