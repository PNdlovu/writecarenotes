import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PayrollRule, PayrollCondition } from '../../types/enterprise';
import { scheduleAPI } from '../../api/scheduleAPI';

export const PayrollIntegration: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRule, setSelectedRule] = useState<PayrollRule | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { data: payrollRules = [] } = useQuery<PayrollRule[]>(
    ['payrollRules'],
    () => scheduleAPI.getPayrollRules(),
  );

  const { data: payrollSummary } = useQuery(
    ['payrollSummary'],
    () => scheduleAPI.getPayrollSummary(),
  );

  const createRuleMutation = useMutation(
    (newRule: Partial<PayrollRule>) => scheduleAPI.createPayrollRule(newRule),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['payrollRules']);
        handleCloseDialog();
      },
    }
  );

  const syncPayrollMutation = useMutation(
    () => scheduleAPI.syncPayrollData(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['payrollSummary']);
      },
    }
  );

  const handleOpenDialog = (rule?: PayrollRule) => {
    setSelectedRule(rule || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedRule(null);
    setDialogOpen(false);
  };

  const handleCreateRule = (formData: any) => {
    createRuleMutation.mutate({
      ...formData,
      conditions: [],
      calculation: {
        type: formData.calculationType,
        value: formData.calculationValue,
      },
    });
  };

  const handleSyncPayroll = () => {
    syncPayrollMutation.mutate();
  };

  const renderPayrollSummary = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Payroll Summary</h3>
        <div className="flex gap-3">
          <button
            onClick={handleSyncPayroll}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <span className="material-icons-outlined">sync</span>
            Sync
          </button>
          <button
            onClick={() => setExportDialogOpen(true)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <span className="material-icons-outlined">upload</span>
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrollSummary?.categories.map((category) => (
              <tr key={category.name}>
                <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">{category.hours}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  ${category.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                {payrollSummary?.totalHours}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                ${payrollSummary?.totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayrollRules = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Payroll Rules</h3>
        <button
          onClick={() => handleOpenDialog()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="material-icons-outlined">add</span>
          Add Rule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rule Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calculation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrollRules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap">{rule.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                    {rule.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rule.calculation.type === 'multiplier'
                    ? `${rule.calculation.value}x`
                    : rule.calculation.type === 'fixed'
                    ? `$${rule.calculation.value}`
                    : 'Custom'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenDialog(rule)}
                    className="text-gray-600 hover:text-blue-600 mx-2"
                  >
                    <span className="material-icons-outlined">edit</span>
                  </button>
                  <button className="text-gray-600 hover:text-red-600 mx-2">
                    <span className="material-icons-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payroll Integration</h2>

      <div className="grid grid-cols-1 gap-6">
        {renderPayrollSummary()}
        {renderPayrollRules()}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRule ? 'Edit Payroll Rule' : 'Create Payroll Rule'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Rule Name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedRule?.name}
                />
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedRule?.type || 'overtime'}
                >
                  <option value="overtime">Overtime</option>
                  <option value="differential">Shift Differential</option>
                  <option value="premium">Premium Pay</option>
                  <option value="allowance">Allowance</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedRule?.calculation.type || 'multiplier'}
                >
                  <option value="multiplier">Multiplier</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="formula">Custom Formula</option>
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Calculation Value"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedRule?.calculation.value}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateRule({})}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedRule ? 'Save Changes' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {exportDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Export Payroll Data</h3>
            <div className="space-y-4">
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="csv"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setExportDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
