import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { Icons } from '@/components/ui/icons'
import { formatCurrency, formatDate } from '@/lib/formatting'

interface PayrollSummaryProps {
  period: {
    startDate: Date
    endDate: Date
    status: string
    totalGrossPay: number
    totalNetPay: number
    totalTax: number
    employeeCount: number
    currency: string
    region: string
    complianceStatus: {
      minimumWage: boolean
      workingTime: boolean
      holidayPay: boolean
      pensionContributions: boolean
    }
    careMetrics?: {
      nightShiftCount: number
      specialDutyHours: number
      qualifiedStaffPercentage: number
    }
    staffingMetrics?: {
      permanentStaff: number
      bankStaff: number
      agencyStaff: number
      totalAgencyCost: number
      agencyPercentage: number
    }
    payrollMetrics?: {
      totalAllowances: number
      totalDeductions: number
      averageHourlyRate: number
      overtimeHours: number
      sickPayCost: number
      holidayPayAccrual: number
    }
    taxDetails?: {
      paye: number
      nationalInsurance: number
      studentLoanDeductions: number
      pensionContributions: number
      apprenticeshipsLevy: number
    }
    forecast?: {
      nextMonthEstimate: number
      yearEndProjection: number
      varianceFromBudget: number
      seasonalFactors: {
        holidayPeriod: boolean
        peakCareRequirements: boolean
        trainingCycles: boolean
      }
    }
    hmrcReporting?: {
      rtiFiling: {
        status: 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'
        lastSubmission: Date
        nextDeadline: Date
        errors?: Array<{
          code: string
          message: string
        }>
      }
      yearEnd: {
        p60Status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
        p11dStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
        taxYearEndDate: Date
      }
    }
    pensionTracking?: {
      totalEnrolled: number
      optOutRate: number
      reEnrollmentDue: Date
      contributions: {
        employee: number
        employer: number
        total: number
      }
    }
  }
  onApprove?: () => void
  onDownload?: () => void
}

export function PayrollSummary({ period, onApprove, onDownload }: PayrollSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Period Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">Payroll Period</CardTitle>
              <CardDescription>
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </CardDescription>
            </div>
            <Badge 
              className={`mt-2 md:mt-0 text-sm px-3 py-1 ${getStatusColor(period.status)}`}
            >
              {period.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gross Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(period.totalGrossPay, period.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Net Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(period.totalNetPay, period.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              After deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(period.totalTax, period.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Including NI/PRSI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {period.employeeCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Total staff processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Check</CardTitle>
          <CardDescription>Regional requirements for {period.region}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Minimum Wage Requirements</span>
              {period.complianceStatus.minimumWage ? (
                <Badge variant="success" className="bg-green-100 text-green-800">
                  <Icons.check className="w-4 h-4 mr-1" />
                  Compliant
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  <Icons.alertTriangle className="w-4 h-4 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Working Time Regulations</span>
              {period.complianceStatus.workingTime ? (
                <Badge variant="success" className="bg-green-100 text-green-800">
                  <Icons.check className="w-4 h-4 mr-1" />
                  Compliant
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  <Icons.alertTriangle className="w-4 h-4 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Holiday Pay Calculation</span>
              {period.complianceStatus.holidayPay ? (
                <Badge variant="success" className="bg-green-100 text-green-800">
                  <Icons.check className="w-4 h-4 mr-1" />
                  Compliant
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  <Icons.alertTriangle className="w-4 h-4 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Pension Contributions</span>
              {period.complianceStatus.pensionContributions ? (
                <Badge variant="success" className="bg-green-100 text-green-800">
                  <Icons.check className="w-4 h-4 mr-1" />
                  Compliant
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  <Icons.alertTriangle className="w-4 h-4 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Care Metrics */}
      {period.careMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Care Home Metrics</CardTitle>
            <CardDescription>Additional care-specific information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Night Shifts</h4>
                <p className="text-2xl font-bold">{period.careMetrics.nightShiftCount}</p>
                <p className="text-xs text-muted-foreground">Total night shifts covered</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Special Duty Hours</h4>
                <p className="text-2xl font-bold">{period.careMetrics.specialDutyHours}</p>
                <p className="text-xs text-muted-foreground">Specialist care hours</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Qualified Staff</h4>
                <p className="text-2xl font-bold">{period.careMetrics.qualifiedStaffPercentage}%</p>
                <p className="text-xs text-muted-foreground">Staff with required qualifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staffing Breakdown */}
      {period.staffingMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staffing Breakdown</CardTitle>
            <CardDescription>Staff composition and agency usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Permanent Staff</h4>
                <p className="text-2xl font-bold">{period.staffingMetrics.permanentStaff}</p>
                <p className="text-xs text-muted-foreground">Full & part-time employees</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Bank Staff</h4>
                <p className="text-2xl font-bold">{period.staffingMetrics.bankStaff}</p>
                <p className="text-xs text-muted-foreground">Internal bank workers</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Agency Staff</h4>
                <p className="text-2xl font-bold">{period.staffingMetrics.agencyStaff}</p>
                <p className="text-xs text-muted-foreground">
                  {period.staffingMetrics.agencyPercentage}% of workforce
                </p>
              </div>
            </div>
            
            {period.staffingMetrics.agencyStaff > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Agency Costs</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.staffingMetrics.totalAgencyCost, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {period.staffingMetrics.agencyPercentage}% of total payroll cost
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payroll Details */}
      {period.payrollMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payroll Details</CardTitle>
            <CardDescription>Detailed breakdown of pay components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total Allowances</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.payrollMetrics.totalAllowances, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">Additional payments</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Overtime Hours</h4>
                <p className="text-2xl font-bold">{period.payrollMetrics.overtimeHours}</p>
                <p className="text-xs text-muted-foreground">At enhanced rates</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Average Rate</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.payrollMetrics.averageHourlyRate, period.currency)}/hr
                </p>
                <p className="text-xs text-muted-foreground">Across all staff</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Sick Pay Cost</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.payrollMetrics.sickPayCost, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">Total sick leave payments</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Holiday Accrual</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.payrollMetrics.holidayPayAccrual, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">Accrued holiday pay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax & Deductions */}
      {period.taxDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax & Deductions</CardTitle>
            <CardDescription>Statutory payments and deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>PAYE Tax</span>
                <span className="font-bold">
                  {formatCurrency(period.taxDetails.paye, period.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>National Insurance</span>
                <span className="font-bold">
                  {formatCurrency(period.taxDetails.nationalInsurance, period.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Student Loan</span>
                <span className="font-bold">
                  {formatCurrency(period.taxDetails.studentLoanDeductions, period.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pension Contributions</span>
                <span className="font-bold">
                  {formatCurrency(period.taxDetails.pensionContributions, period.currency)}
                </span>
              </div>
              {period.taxDetails.apprenticeshipsLevy > 0 && (
                <div className="flex justify-between items-center">
                  <span>Apprenticeship Levy</span>
                  <span className="font-bold">
                    {formatCurrency(period.taxDetails.apprenticeshipsLevy, period.currency)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll Forecast */}
      {period.forecast && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payroll Forecast</CardTitle>
            <CardDescription>Projected costs and variances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Next Month</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.forecast.nextMonthEstimate, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">Estimated total cost</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Year End</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.forecast.yearEndProjection, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">Projected annual total</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Budget Variance</h4>
                <p className={`text-2xl font-bold ${period.forecast.varianceFromBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {period.forecast.varianceFromBudget >= 0 ? '+' : ''}
                  {formatCurrency(period.forecast.varianceFromBudget, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">Against budget</p>
              </div>
            </div>

            {/* Seasonal Factors */}
            <div className="mt-4 flex gap-2">
              {period.forecast.seasonalFactors.holidayPeriod && (
                <Badge variant="secondary">Holiday Period</Badge>
              )}
              {period.forecast.seasonalFactors.peakCareRequirements && (
                <Badge variant="secondary">Peak Care Requirements</Badge>
              )}
              {period.forecast.seasonalFactors.trainingCycles && (
                <Badge variant="secondary">Training Cycle</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HMRC Reporting Status */}
      {period.hmrcReporting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">HMRC Reporting</CardTitle>
            <CardDescription>Real-time Information (RTI) status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* RTI Filing Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">RTI Filing Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Last submitted: {formatDate(period.hmrcReporting.rtiFiling.lastSubmission)}
                  </p>
                </div>
                <Badge
                  variant={period.hmrcReporting.rtiFiling.status === 'ACCEPTED' ? 'success' : 'warning'}
                  className={
                    period.hmrcReporting.rtiFiling.status === 'ACCEPTED' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {period.hmrcReporting.rtiFiling.status}
                </Badge>
              </div>

              {/* Filing Errors */}
              {period.hmrcReporting.rtiFiling.errors && period.hmrcReporting.rtiFiling.errors.length > 0 && (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                  <h4 className="font-medium mb-2">Filing Errors</h4>
                  <ul className="space-y-1 text-sm">
                    {period.hmrcReporting.rtiFiling.errors.map(error => (
                      <li key={error.code}>
                        [{error.code}] {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Year End Progress */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium">P60 Status</h4>
                  <Badge variant="outline" className="mt-2">
                    {period.hmrcReporting.yearEnd.p60Status}
                  </Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium">P11D Status</h4>
                  <Badge variant="outline" className="mt-2">
                    {period.hmrcReporting.yearEnd.p11dStatus}
                  </Badge>
                </div>
              </div>

              {/* Next Deadline */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icons.calendar className="w-4 h-4" />
                Next deadline: {formatDate(period.hmrcReporting.rtiFiling.nextDeadline)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pension Auto-Enrollment Tracking */}
      {period.pensionTracking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pension Auto-Enrollment</CardTitle>
            <CardDescription>Enrollment status and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Enrolled Staff</h4>
                <p className="text-2xl font-bold">{period.pensionTracking.totalEnrolled}</p>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Opt-out Rate</h4>
                <p className="text-2xl font-bold">{period.pensionTracking.optOutRate}%</p>
                <p className="text-xs text-muted-foreground">Of eligible staff</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total Contributions</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(period.pensionTracking.contributions.total, period.currency)}
                </p>
                <p className="text-xs text-muted-foreground">This period</p>
              </div>
            </div>

            {/* Re-enrollment Notice */}
            {new Date(period.pensionTracking.reEnrollmentDue) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <Icons.alertTriangle className="w-4 h-4" />
                  Re-enrollment Due
                </h4>
                <p className="text-sm mt-1">
                  Re-enrollment assessment due by {formatDate(period.pensionTracking.reEnrollmentDue)}
                </p>
              </div>
            )}

            {/* Contribution Breakdown */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Contribution Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Employee Contributions</span>
                  <span className="font-medium">
                    {formatCurrency(period.pensionTracking.contributions.employee, period.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Employer Contributions</span>
                  <span className="font-medium">
                    {formatCurrency(period.pensionTracking.contributions.employer, period.currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {onApprove && period.status.toLowerCase() === 'draft' && (
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={onApprove}
              >
                <Icons.check className="w-4 h-4 mr-2" />
                Approve Payroll
              </Button>
            )}
            
            {onDownload && (
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-auto"
                onClick={onDownload}
              >
                <Icons.download className="w-4 h-4 mr-2" />
                Download Reports
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Need Help?</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Click "Approve Payroll" to finalize this period</li>
          <li>Download reports include payslips and summaries</li>
          <li>Contact support if you need assistance</li>
        </ul>
      </div>
    </div>
  )
} 