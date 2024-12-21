import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStockManagement } from '../../hooks/useStockManagement';
import type { MedicationStock } from '../../types';

interface StockManagementProps {
  careHomeId: string;
}

export function StockManagement({ careHomeId }: StockManagementProps) {
  const { stocks, isLoading, error } = useStockManagement(careHomeId);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Stock Management</h2>
        <Button>Order Stock</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medication</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Stock items */}
        </TableBody>
      </Table>
    </Card>
  );
} 