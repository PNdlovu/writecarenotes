import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  FileTextIcon, 
  CheckCircleIcon, 
  DownloadIcon 
} from 'lucide-react';

export default function PayrollActions() {
  return (
    <div className="space-y-4">
      <Button
        variant="default"
        className="w-full justify-start"
        onClick={() => window.location.href = '/payroll/run-payroll'}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        Run New Payroll
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => window.location.href = '/payroll/reports'}
      >
        <FileTextIcon className="mr-2 h-4 w-4" />
        Generate Reports
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => window.location.href = '/payroll/approvals'}
      >
        <CheckCircleIcon className="mr-2 h-4 w-4" />
        Review & Approve
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => window.location.href = '/payroll/export'}
      >
        <DownloadIcon className="mr-2 h-4 w-4" />
        Export Data
      </Button>
    </div>
  );
}


