import React from 'react';
import { PayrollService } from '@/lib/payroll/services/payroll-service';
import { LocalStorageRepository } from '@/lib/storage/localStorageRepository';
import { Region, TaxYear, NICategory } from '@/lib/payroll/types';
import { useTenantContext } from '@/lib/multi-tenant/hooks';
import { PayrollFormData } from '../../types/payroll.types';

const initialFormData: PayrollFormData = {
  employeeId: '',
  grossPay: 0,
  region: Region.ENGLAND,
  taxYear: TaxYear.Y2024_2025,
  niCategory: NICategory.A,
  taxCode: '',
  pensionContribution: 0
};

export default function PayrollCalculator() {
  const tenantContext = useTenantContext();
  const [formData, setFormData] = React.useState<PayrollFormData>(initialFormData);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'grossPay' || name === 'pensionContribution' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const calculatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const storage = new LocalStorageRepository('payroll');
      const payrollService = new PayrollService(tenantContext, storage);

      const result = await payrollService.calculatePayroll(
        formData.employeeId,
        formData.grossPay,
        formData.region,
        formData.taxYear,
        {
          niCategory: formData.niCategory,
          taxCode: formData.taxCode,
          pensionContribution: formData.pensionContribution
        }
      );

      setResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={calculatePayroll} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee ID
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gross Pay
            </label>
            <input
              type="number"
              name="grossPay"
              value={formData.grossPay}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              {Object.values(Region).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tax Year
            </label>
            <select
              name="taxYear"
              value={formData.taxYear}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              {Object.values(TaxYear).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              NI Category
            </label>
            <select
              name="niCategory"
              value={formData.niCategory}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            >
              {Object.values(NICategory).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tax Code
            </label>
            <input
              type="text"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pension Contribution (%)
            </label>
            <input
              type="number"
              name="pensionContribution"
              value={formData.pensionContribution}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Calculation Result</h2>
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded shadow">
            <div>
              <h3 className="font-medium text-gray-700">Gross Pay</h3>
              <p className="text-2xl font-bold">{result.formattedGrossPay}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Net Pay</h3>
              <p className="text-2xl font-bold text-green-600">{result.formattedNetPay}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Deductions</h3>
            <div className="space-y-2">
              {result.deductions.map((deduction: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between p-3 bg-gray-50 rounded"
                >
                  <span>{deduction.type}</span>
                  <span className="font-medium text-red-600">
                    {deduction.formattedAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


