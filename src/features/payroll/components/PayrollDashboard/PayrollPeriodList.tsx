import { PayrollPeriod, PayrollStatus } from '../../types/payroll.types';
import { formatCurrency } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EyeIcon, FileTextIcon, CheckCircleIcon } from 'lucide-react';

async function getPayrollPeriods(): Promise<PayrollPeriod[]> {
  const response = await fetch('/api/payroll/periods');
  return response.json();
}

export default async function PayrollPeriodList() {
  const periods = await getPayrollPeriods();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Gross Pay</TableHead>
            <TableHead className="text-right">Net Pay</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last updated: {period.updatedAt.toLocaleString()}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={period.status === PayrollStatus.APPROVED ? 'success' : 
                         period.status === PayrollStatus.FAILED ? 'destructive' : 
                         'default'}
                >
                  {period.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(period.totalGrossPay)}</TableCell>
              <TableCell className="text-right">{formatCurrency(period.totalNetPay)}</TableCell>
              <TableCell className="text-right">{period.employeeCount}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.location.href = `/payroll/periods/${period.id}`}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.location.href = `/payroll/periods/${period.id}/reports`}
                  >
                    <FileTextIcon className="h-4 w-4" />
                  </Button>
                  {period.status === PayrollStatus.READY_FOR_REVIEW && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.location.href = `/payroll/periods/${period.id}/approve`}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


