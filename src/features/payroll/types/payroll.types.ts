export enum PayrollStatus {
  DRAFT = 'DRAFT',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface PayrollPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  status: PayrollStatus;
  totalGrossPay: number;
  totalNetPay: number;
  employeeCount: number;
  updatedAt: Date;
}

export interface PayrollStats {
  totalPayrollYTD: number;
  payrollYTDGrowth: number;
  activeEmployees: number;
  newEmployeesThisMonth: number;
  nextPayDate: string;
  daysUntilNextPayroll: number;
  averageSalary: number;
  averageSalaryGrowth: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  periodId: string;
  basePay: number;
  overtime: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  createdAt: Date;
  updatedAt: Date;
}


