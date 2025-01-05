/**
 * @writecarenotes.com
 * @fileoverview Transaction history component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying medication stock transaction history
 * with filtering and sorting capabilities.
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge/Badge';
import { Input } from '@/components/ui/Form/Input';
import { Button } from '@/components/ui/Button/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { 
  ArrowUpDown, 
  Calendar,
  Download,
  Search
} from 'lucide-react';
import { ExportService } from '../../services/exportService';
import type { StockTransaction } from '../../types';

interface TransactionHistoryProps {
  transactions: StockTransaction[];
  isLoading: boolean;
}

const exportService = new ExportService();

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = transactions
    .filter(transaction => {
      if (transactionType !== 'all' && transaction.type !== transactionType) {
        return false;
      }
      
      const searchString = `
        ${transaction.type}
        ${transaction.batchNumber || ''}
        ${transaction.supplier || ''}
        ${transaction.notes || ''}
      `.toLowerCase();
      
      return searchString.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getTransactionBadgeColor = (type: string) => {
    return type === 'RECEIPT' ? 'success' : 'warning';
  };

  const handleExport = () => {
    exportService.exportTransactions(filteredTransactions);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={transactionType}
            onValueChange={setTransactionType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="RECEIPT">Receipt</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={filteredTransactions.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                  className="font-semibold"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(transaction.transactionDate), 'dd MMM yyyy HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTransactionBadgeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                  </TableCell>
                  <TableCell>{transaction.batchNumber || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Before: {transaction.stockLevelBefore}</div>
                      <div>After: {transaction.stockLevelAfter}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.type === 'RECEIPT' 
                      ? transaction.receivedBy 
                      : transaction.adjustedBy}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.notes || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 