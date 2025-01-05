import { PayrollWorker } from './payrollWorker';

let worker: PayrollWorker | null = null;

export function startPayrollWorker() {
  if (!worker) {
    worker = new PayrollWorker();
    worker.start();
  }
  return worker;
}

export function stopPayrollWorker() {
  if (worker) {
    worker.stop();
    worker = null;
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down payroll worker...');
  stopPayrollWorker();
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down payroll worker...');
  stopPayrollWorker();
});


