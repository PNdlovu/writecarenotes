/**
 * @fileoverview Statement Export Service Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { StatementExportService } from '../statementExportService';
import { Currency } from '../../core/types';

describe('StatementExportService', () => {
  const service = new StatementExportService();
  const currency: Currency = { code: 'GBP', symbol: '£', name: 'British Pound' };
  const locale = 'en-GB';

  const mockBalanceSheet = {
    asOf: new Date('2024-03-21'),
    assets: {
      current: [
        { id: '1', name: 'Cash', balance: 10000 },
        { id: '2', name: 'Accounts Receivable', balance: 5000 }
      ],
      fixed: [
        { id: '3', name: 'Equipment', balance: 50000 },
        { id: '4', name: 'Buildings', balance: 200000 }
      ],
      total: 265000
    },
    liabilities: {
      current: [
        { id: '5', name: 'Accounts Payable', balance: 8000 },
        { id: '6', name: 'Short Term Loans', balance: 15000 }
      ],
      longTerm: [
        { id: '7', name: 'Long Term Loans', balance: 100000 }
      ],
      total: 123000
    },
    equity: {
      accounts: [
        { id: '8', name: 'Share Capital', balance: 100000 },
        { id: '9', name: 'Retained Earnings', balance: 42000 }
      ],
      total: 142000
    }
  };

  const mockIncomeStatement = {
    period: {
      start: new Date('2024-01-01'),
      end: new Date('2024-03-31')
    },
    revenue: {
      accounts: [
        { id: '1', name: 'Care Home Fees', balance: 150000 },
        { id: '2', name: 'Additional Services', balance: 25000 }
      ],
      total: 175000
    },
    expenses: {
      accounts: [
        { id: '3', name: 'Staff Costs', balance: 80000 },
        { id: '4', name: 'Supplies', balance: 20000 },
        { id: '5', name: 'Utilities', balance: 15000 }
      ],
      total: 115000
    },
    netIncome: 60000
  };

  const mockCashFlow = {
    period: {
      start: new Date('2024-01-01'),
      end: new Date('2024-03-31')
    },
    operating: {
      inflows: [
        {
          id: '1',
          description: 'Care Home Fees',
          entries: [
            { type: 'DEBIT', amount: 150000 }
          ]
        }
      ],
      outflows: [
        {
          id: '2',
          description: 'Staff Payments',
          entries: [
            { type: 'CREDIT', amount: 80000 }
          ]
        }
      ],
      net: 70000
    },
    investing: {
      inflows: [],
      outflows: [
        {
          id: '3',
          description: 'Equipment Purchase',
          entries: [
            { type: 'CREDIT', amount: 20000 }
          ]
        }
      ],
      net: -20000
    },
    financing: {
      inflows: [
        {
          id: '4',
          description: 'Loan Received',
          entries: [
            { type: 'DEBIT', amount: 50000 }
          ]
        }
      ],
      outflows: [
        {
          id: '5',
          description: 'Loan Repayment',
          entries: [
            { type: 'CREDIT', amount: 10000 }
          ]
        }
      ],
      net: 40000
    },
    netChange: 90000
  };

  describe('exportStatement', () => {
    it('exports balance sheet to CSV', async () => {
      const blob = await service.exportStatement('BALANCE_SHEET', mockBalanceSheet, {
        format: 'CSV',
        currency,
        locale,
        includeHeaders: true
      });

      const content = await blob.text();
      
      // Verify headers
      expect(content).toContain('BALANCE SHEET');
      expect(content).toContain(`As of ${mockBalanceSheet.asOf.toLocaleDateString('en-GB')}`);
      
      // Verify assets section
      expect(content).toContain('ASSETS');
      mockBalanceSheet.assets.current.forEach(account => {
        expect(content).toContain(account.name);
        expect(content).toContain('£' + (account.balance / 100).toFixed(2));
      });
      
      // Verify liabilities section
      expect(content).toContain('LIABILITIES');
      mockBalanceSheet.liabilities.current.forEach(account => {
        expect(content).toContain(account.name);
        expect(content).toContain('£' + (account.balance / 100).toFixed(2));
      });
      
      // Verify equity section
      expect(content).toContain('EQUITY');
      mockBalanceSheet.equity.accounts.forEach(account => {
        expect(content).toContain(account.name);
        expect(content).toContain('£' + (account.balance / 100).toFixed(2));
      });
      
      // Verify totals
      expect(content).toContain(`TOTAL ASSETS,£${(mockBalanceSheet.assets.total / 100).toFixed(2)}`);
      expect(content).toContain(`TOTAL LIABILITIES,£${(mockBalanceSheet.liabilities.total / 100).toFixed(2)}`);
      expect(content).toContain(`TOTAL EQUITY,£${(mockBalanceSheet.equity.total / 100).toFixed(2)}`);
    });

    it('exports income statement to CSV', async () => {
      const blob = await service.exportStatement('INCOME_STATEMENT', mockIncomeStatement, {
        format: 'CSV',
        currency,
        locale,
        includeHeaders: true
      });

      const content = await blob.text();
      
      // Verify headers
      expect(content).toContain('INCOME STATEMENT');
      expect(content).toContain(`Period: ${mockIncomeStatement.period.start.toLocaleDateString('en-GB')} to ${mockIncomeStatement.period.end.toLocaleDateString('en-GB')}`);
      
      // Verify revenue section
      expect(content).toContain('REVENUE');
      mockIncomeStatement.revenue.accounts.forEach(account => {
        expect(content).toContain(account.name);
        expect(content).toContain('£' + (account.balance / 100).toFixed(2));
      });
      
      // Verify expenses section
      expect(content).toContain('EXPENSES');
      mockIncomeStatement.expenses.accounts.forEach(account => {
        expect(content).toContain(account.name);
        expect(content).toContain('£' + (account.balance / 100).toFixed(2));
      });
      
      // Verify net income
      expect(content).toContain(`NET INCOME,£${(mockIncomeStatement.netIncome / 100).toFixed(2)}`);
    });

    it('exports cash flow statement to CSV', async () => {
      const blob = await service.exportStatement('CASH_FLOW', mockCashFlow, {
        format: 'CSV',
        currency,
        locale,
        includeHeaders: true
      });

      const content = await blob.text();
      
      // Verify headers
      expect(content).toContain('CASH FLOW STATEMENT');
      expect(content).toContain(`Period: ${mockCashFlow.period.start.toLocaleDateString('en-GB')} to ${mockCashFlow.period.end.toLocaleDateString('en-GB')}`);
      
      // Verify operating activities
      expect(content).toContain('OPERATING ACTIVITIES');
      mockCashFlow.operating.inflows.forEach(transaction => {
        expect(content).toContain(transaction.description);
      });
      mockCashFlow.operating.outflows.forEach(transaction => {
        expect(content).toContain(transaction.description);
      });
      expect(content).toContain(`Net Cash from Operating Activities,£${(mockCashFlow.operating.net / 100).toFixed(2)}`);
      
      // Verify investing activities
      expect(content).toContain('INVESTING ACTIVITIES');
      mockCashFlow.investing.outflows.forEach(transaction => {
        expect(content).toContain(transaction.description);
      });
      expect(content).toContain(`Net Cash from Investing Activities,£${(mockCashFlow.investing.net / 100).toFixed(2)}`);
      
      // Verify financing activities
      expect(content).toContain('FINANCING ACTIVITIES');
      mockCashFlow.financing.inflows.forEach(transaction => {
        expect(content).toContain(transaction.description);
      });
      mockCashFlow.financing.outflows.forEach(transaction => {
        expect(content).toContain(transaction.description);
      });
      expect(content).toContain(`Net Cash from Financing Activities,£${(mockCashFlow.financing.net / 100).toFixed(2)}`);
      
      // Verify net change
      expect(content).toContain(`NET CHANGE IN CASH,£${(mockCashFlow.netChange / 100).toFixed(2)}`);
    });

    it('throws error for unsupported statement type', async () => {
      await expect(
        service.exportStatement(
          'INVALID_TYPE' as any,
          mockBalanceSheet,
          { format: 'CSV', currency, locale }
        )
      ).rejects.toThrow('Unsupported statement type: INVALID_TYPE');
    });

    it('respects includeHeaders option', async () => {
      const blob = await service.exportStatement('BALANCE_SHEET', mockBalanceSheet, {
        format: 'CSV',
        currency,
        locale,
        includeHeaders: false
      });

      const content = await blob.text();
      expect(content).not.toContain('BALANCE SHEET');
      expect(content).not.toContain(`As of ${mockBalanceSheet.asOf.toLocaleDateString('en-GB')}`);
    });
  });

  describe('downloadStatement', () => {
    let originalCreateElement: typeof document.createElement;
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;
    let mockAnchor: { href: string; download: string; click: jest.Mock; remove: jest.Mock };

    beforeEach(() => {
      mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };

      originalCreateElement = document.createElement;
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;

      document.createElement = jest.fn().mockReturnValue(mockAnchor);
      URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('creates and clicks download link', () => {
      const blob = new Blob(['test content']);
      const filename = 'test.csv';

      service.downloadStatement(blob, filename);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(mockAnchor.download).toBe(filename);
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.remove).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
}); 


