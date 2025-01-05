import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import { PayrollStats as PayrollStatsType } from '../../types/payroll.types';
import { DollarSignIcon, UsersIcon, CalendarIcon, TrendingUpIcon } from 'lucide-react';

async function getPayrollStats(): Promise<PayrollStatsType> {
  const response = await fetch('/api/payroll/stats');
  return response.json();
}

export default async function PayrollStats() {
  const stats = await getPayrollStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payroll YTD</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalPayrollYTD)}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.payrollYTDGrowth}% from last year
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeEmployees}</div>
          <p className="text-xs text-muted-foreground">
            {stats.newEmployeesThisMonth} new this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Pay Date</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(stats.nextPayDate).toLocaleDateString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.daysUntilNextPayroll} days remaining
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.averageSalary)}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.averageSalaryGrowth}% from last year
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


