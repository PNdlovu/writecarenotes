/**
 * @fileoverview Account List Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Component for displaying and managing the chart of accounts
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { useRegionalCompliance } from '../../hooks/useRegionalCompliance';
import { useAccountStore } from '../../stores/accountStore';

export function AccountList() {
  const router = useRouter();
  const { toast } = useToast();
  const { formatCurrency } = useRegionalCompliance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    deleteAccount,
  } = useAccountStore();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Implement debounced search
  };

  const handleTypeFilter = (type: string | null) => {
    setSelectedType(type);
    // Implement type filtering
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    // Implement category filtering
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      toast({
        title: 'Account deleted',
        description: 'The account has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading accounts...</div>;
  }

  if (error) {
    return <div>Error loading accounts: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chart of Accounts</h2>
        <Button onClick={() => router.push('/accounting/accounts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {selectedType || 'All Types'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleTypeFilter(null)}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter('ASSET')}>
              Asset
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter('LIABILITY')}>
              Liability
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter('EQUITY')}>
              Equity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter('REVENUE')}>
              Revenue
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter('EXPENSE')}>
              Expense
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.code}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell>{account.category}</TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/accounting/accounts/${account.id}`)
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/accounting/accounts/${account.id}/view`)
                        }
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(account.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 