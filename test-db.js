const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Sunshine Care Home'
      }
    });
    console.log('Created organization:', org);

    // Create Chart of Accounts
    const accounts = await Promise.all([
      // Asset Accounts (1000-1999)
      createAccount(org.id, '1000', 'Cash in Hand', 'ASSET', 'Current Assets'),
      createAccount(org.id, '1100', 'Main Bank Account', 'ASSET', 'Current Assets'),
      createAccount(org.id, '1200', 'Accounts Receivable', 'ASSET', 'Current Assets'),
      createAccount(org.id, '1300', 'Prepaid Expenses', 'ASSET', 'Current Assets'),
      createAccount(org.id, '1400', 'Equipment', 'ASSET', 'Fixed Assets'),
      createAccount(org.id, '1500', 'Buildings', 'ASSET', 'Fixed Assets'),
      createAccount(org.id, '1600', 'Accumulated Depreciation', 'ASSET', 'Fixed Assets'),

      // Liability Accounts (2000-2999)
      createAccount(org.id, '2000', 'Accounts Payable', 'LIABILITY', 'Current Liabilities'),
      createAccount(org.id, '2100', 'Salaries Payable', 'LIABILITY', 'Current Liabilities'),
      createAccount(org.id, '2200', 'VAT Payable', 'LIABILITY', 'Current Liabilities'),
      createAccount(org.id, '2300', 'Deferred Revenue', 'LIABILITY', 'Current Liabilities'),
      createAccount(org.id, '2400', 'Long Term Loans', 'LIABILITY', 'Long Term Liabilities'),

      // Equity Accounts (3000-3999)
      createAccount(org.id, '3000', 'Share Capital', 'EQUITY', 'Capital'),
      createAccount(org.id, '3100', 'Retained Earnings', 'EQUITY', 'Capital'),

      // Revenue Accounts (4000-4999)
      createAccount(org.id, '4000', 'Residential Care Income', 'REVENUE', 'Operating Revenue'),
      createAccount(org.id, '4100', 'Nursing Care Income', 'REVENUE', 'Operating Revenue'),
      createAccount(org.id, '4200', 'Dementia Care Income', 'REVENUE', 'Operating Revenue'),
      createAccount(org.id, '4300', 'Additional Services Income', 'REVENUE', 'Operating Revenue'),
      createAccount(org.id, '4400', 'NHS Funded Care Income', 'REVENUE', 'Operating Revenue'),

      // Expense Accounts (5000-5999)
      createAccount(org.id, '5000', 'Staff Salaries', 'EXPENSE', 'Direct Expenses'),
      createAccount(org.id, '5100', 'Medical Supplies', 'EXPENSE', 'Direct Expenses'),
      createAccount(org.id, '5200', 'Food and Dietary', 'EXPENSE', 'Direct Expenses'),
      createAccount(org.id, '5300', 'Utilities', 'EXPENSE', 'Overhead'),
      createAccount(org.id, '5400', 'Maintenance', 'EXPENSE', 'Overhead'),
      createAccount(org.id, '5500', 'Insurance', 'EXPENSE', 'Overhead'),
      createAccount(org.id, '5600', 'Training', 'EXPENSE', 'Staff Development'),
      createAccount(org.id, '5700', 'Office Supplies', 'EXPENSE', 'Administrative'),
      createAccount(org.id, '5800', 'Professional Fees', 'EXPENSE', 'Administrative'),
      createAccount(org.id, '5900', 'Depreciation', 'EXPENSE', 'Non-Cash')
    ]);

    console.log('Created chart of accounts');

    // Create Cost Center Hierarchy
    const mainFacility = await prisma.costCenter.create({
      data: {
        organizationId: org.id,
        code: 'MAIN',
        name: 'Main Facility',
        description: 'Main care home facility',
        createdBy: 'system'
      }
    });

    const departments = await Promise.all([
      // Care Departments
      createCostCenter(org.id, 'RES', 'Residential Care', mainFacility.id),
      createCostCenter(org.id, 'NURS', 'Nursing Care', mainFacility.id),
      createCostCenter(org.id, 'DEM', 'Dementia Care', mainFacility.id),

      // Support Departments
      createCostCenter(org.id, 'ADMIN', 'Administration', mainFacility.id),
      createCostCenter(org.id, 'MAINT', 'Maintenance', mainFacility.id),
      createCostCenter(org.id, 'CATER', 'Catering', mainFacility.id),
      createCostCenter(org.id, 'HOUSE', 'Housekeeping', mainFacility.id)
    ]);

    console.log('Created cost centers');

    // Create sample transactions
    const transactions = [
      // 1. Regular Monthly Residential Care Fees
      {
        reference: 'JE-2024-001',
        description: 'January Residential Care Fees',
        amount: 12000.00,
        lines: [
          { account: '1100', costCenter: 'RES', debit: 12000.00, description: 'Bank Receipt' },
          { account: '4000', costCenter: 'RES', credit: 10000.00, description: 'Care Fees' },
          { account: '2200', costCenter: 'RES', credit: 2000.00, description: 'VAT' }
        ]
      },

      // 2. NHS Funded Care Income
      {
        reference: 'JE-2024-004',
        description: 'NHS Funded Care - January',
        amount: 8400.00,
        lines: [
          { account: '1200', costCenter: 'NURS', debit: 8400.00, description: 'NHS Receivable' },
          { account: '4400', costCenter: 'NURS', credit: 7000.00, description: 'NHS Care Income' },
          { account: '2200', costCenter: 'NURS', credit: 1400.00, description: 'VAT' }
        ]
      },

      // 3. Staff Salaries with Multiple Departments
      {
        reference: 'JE-2024-002',
        description: 'January Staff Salaries',
        amount: 15000.00,
        lines: [
          { account: '5000', costCenter: 'RES', debit: 5000.00, description: 'Residential Care Staff' },
          { account: '5000', costCenter: 'NURS', debit: 6000.00, description: 'Nursing Staff' },
          { account: '5000', costCenter: 'DEM', debit: 4000.00, description: 'Dementia Care Staff' },
          { account: '1100', costCenter: 'ADMIN', credit: 15000.00, description: 'Salary Payment' }
        ]
      },

      // 4. Medical Supplies Purchase
      {
        reference: 'JE-2024-005',
        description: 'Medical Supplies - January',
        amount: 3600.00,
        lines: [
          { account: '5100', costCenter: 'NURS', debit: 2000.00, description: 'Nursing Supplies' },
          { account: '5100', costCenter: 'DEM', debit: 1000.00, description: 'Dementia Care Supplies' },
          { account: '2200', costCenter: 'ADMIN', debit: 600.00, description: 'VAT' },
          { account: '2000', costCenter: 'ADMIN', credit: 3600.00, description: 'Supplier Payment Due' }
        ]
      },

      // 5. Utility Bills
      {
        reference: 'JE-2024-003',
        description: 'January Utilities',
        amount: 3600.00,
        lines: [
          { account: '5300', costCenter: 'MAINT', debit: 3000.00, description: 'Utility Charges' },
          { account: '2200', costCenter: 'MAINT', debit: 600.00, description: 'VAT' },
          { account: '2000', costCenter: 'MAINT', credit: 3600.00, description: 'Amount Payable' }
        ]
      },

      // 6. Food and Catering Supplies
      {
        reference: 'JE-2024-006',
        description: 'January Food Supplies',
        amount: 4800.00,
        lines: [
          { account: '5200', costCenter: 'CATER', debit: 4000.00, description: 'Food Supplies' },
          { account: '2200', costCenter: 'CATER', debit: 800.00, description: 'VAT' },
          { account: '1100', costCenter: 'CATER', credit: 4800.00, description: 'Payment Made' }
        ]
      },

      // 7. Insurance Premium
      {
        reference: 'JE-2024-007',
        description: 'Annual Insurance Premium',
        amount: 6000.00,
        lines: [
          { account: '5500', costCenter: 'ADMIN', debit: 6000.00, description: 'Insurance Premium' },
          { account: '1100', costCenter: 'ADMIN', credit: 6000.00, description: 'Payment Made' }
        ]
      },

      // 8. Staff Training
      {
        reference: 'JE-2024-008',
        description: 'Staff Training Program',
        amount: 1800.00,
        lines: [
          { account: '5600', costCenter: 'ADMIN', debit: 1500.00, description: 'Training Cost' },
          { account: '2200', costCenter: 'ADMIN', debit: 300.00, description: 'VAT' },
          { account: '2000', costCenter: 'ADMIN', credit: 1800.00, description: 'Training Provider Payment' }
        ]
      },

      // 9. Maintenance Repairs
      {
        reference: 'JE-2024-009',
        description: 'Building Repairs',
        amount: 2400.00,
        lines: [
          { account: '5400', costCenter: 'MAINT', debit: 2000.00, description: 'Repair Costs' },
          { account: '2200', costCenter: 'MAINT', debit: 400.00, description: 'VAT' },
          { account: '1100', costCenter: 'MAINT', credit: 2400.00, description: 'Payment Made' }
        ]
      },

      // 10. Professional Fees
      {
        reference: 'JE-2024-010',
        description: 'Legal and Accounting Fees',
        amount: 3000.00,
        lines: [
          { account: '5800', costCenter: 'ADMIN', debit: 2500.00, description: 'Professional Services' },
          { account: '2200', costCenter: 'ADMIN', debit: 500.00, description: 'VAT' },
          { account: '2000', costCenter: 'ADMIN', credit: 3000.00, description: 'Payment Due' }
        ]
      },

      // 11. Monthly Depreciation
      {
        reference: 'JE-2024-011',
        description: 'January Depreciation',
        amount: 2000.00,
        lines: [
          { account: '5900', costCenter: 'ADMIN', debit: 2000.00, description: 'Monthly Depreciation' },
          { account: '1600', costCenter: 'ADMIN', credit: 2000.00, description: 'Accumulated Depreciation' }
        ]
      },

      // 12. Prepaid Expenses Recognition
      {
        reference: 'JE-2024-012',
        description: 'Insurance Prepayment Recognition',
        amount: 500.00,
        lines: [
          { account: '5500', costCenter: 'ADMIN', debit: 500.00, description: 'Monthly Insurance Expense' },
          { account: '1300', costCenter: 'ADMIN', credit: 500.00, description: 'Prepaid Insurance Recognition' }
        ]
      }
    ];

    // Create transactions for each month (January to March)
    const months = ['January', 'February', 'March'];
    for (const month of months) {
      for (const tx of transactions) {
        const monthTx = {
          ...tx,
          reference: tx.reference.replace('2024-', `2024-${month.substring(0, 3)}-`),
          description: tx.description.replace('January', month),
          lines: tx.lines.map(line => ({
            ...line,
            description: line.description.replace('January', month)
          }))
        };
        await createJournalEntry(org.id, monthTx);
      }
    }

    console.log('Created transactions');

    // Create VAT Returns
    const vatReturns = await Promise.all([
      createVATReturn(org.id, '2024-Q1', new Date('2024-01-01'), new Date('2024-03-31'), 1400.00),
      createVATReturn(org.id, '2023-Q4', new Date('2023-10-01'), new Date('2023-12-31'), 1200.00, 'SUBMITTED')
    ]);

    console.log('Created VAT returns');

    // Create Bank Transactions with different payment methods
    const bankTransactions = await Promise.all([
      // Direct Deposits
      createBankTransaction(org.id, {
        date: new Date(),
        description: 'Resident Care Fees - Direct Deposit',
        reference: 'BANK-2024-001',
        amount: 12000.00,
        type: 'CREDIT',
        accountId: accounts.find(a => a.code === '1100').id
      }),
      // BACS Payments
      createBankTransaction(org.id, {
        date: new Date(),
        description: 'Staff Salary Payment - BACS',
        reference: 'BANK-2024-002',
        amount: 15000.00,
        type: 'DEBIT',
        accountId: accounts.find(a => a.code === '1100').id
      }),
      // Standing Orders
      createBankTransaction(org.id, {
        date: new Date(),
        description: 'Insurance Premium - Standing Order',
        reference: 'BANK-2024-003',
        amount: 6000.00,
        type: 'DEBIT',
        accountId: accounts.find(a => a.code === '1100').id
      }),
      // Direct Debits
      createBankTransaction(org.id, {
        date: new Date(),
        description: 'Utility Payment - Direct Debit',
        reference: 'BANK-2024-004',
        amount: 3600.00,
        type: 'DEBIT',
        accountId: accounts.find(a => a.code === '1100').id
      }),
      // Cheque Deposits
      createBankTransaction(org.id, {
        date: new Date(),
        description: 'NHS Payment - Cheque',
        reference: 'BANK-2024-005',
        amount: 8400.00,
        type: 'CREDIT',
        accountId: accounts.find(a => a.code === '1100').id
      })
    ]);

    console.log('Created bank transactions');

    // Create Reconciliation
    const reconciliation = await createReconciliation(org.id, {
      date: new Date(),
      reference: 'REC-2024-001',
      description: 'January Bank Reconciliation',
      accountId: accounts.find(a => a.code === '1100').id,
      transactions: bankTransactions.map(t => t.id)
    });

    console.log('Created reconciliation');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
async function createAccount(orgId, code, name, type, category) {
  return prisma.account.create({
    data: {
      organizationId: orgId,
      code,
      name,
      type,
      category,
      description: `${category} - ${name}`,
      createdBy: 'system'
    }
  });
}

async function createCostCenter(orgId, code, name, parentId = null) {
  return prisma.costCenter.create({
    data: {
      organizationId: orgId,
      code,
      name,
      description: `${name} Department`,
      parentCostCenterId: parentId,
      createdBy: 'system'
    }
  });
}

async function createJournalEntry(orgId, data) {
  const accounts = await prisma.account.findMany({
    where: { organizationId: orgId }
  });

  const costCenters = await prisma.costCenter.findMany({
    where: { organizationId: orgId }
  });

  return prisma.journalEntry.create({
    data: {
      organizationId: orgId,
      accountId: accounts.find(a => a.code === data.lines[0].account).id,
      costCenterId: costCenters.find(c => c.code === data.lines[0].costCenter).id,
      date: new Date(),
      reference: data.reference,
      description: data.description,
      amount: data.amount,
      type: data.lines[0].debit > 0 ? 'DEBIT' : 'CREDIT',
      status: 'POSTED',
      createdBy: 'system',
      lines: {
        create: data.lines.map(line => ({
          accountId: accounts.find(a => a.code === line.account).id,
          costCenterId: costCenters.find(c => c.code === line.costCenter).id,
          description: line.description,
          debit: line.debit || 0,
          credit: line.credit || 0
        }))
      }
    }
  });
}

async function createVATReturn(orgId, period, startDate, endDate, vatDue, status = 'DRAFT') {
  return prisma.vATReturn.create({
    data: {
      organizationId: orgId,
      period,
      startDate,
      endDate,
      status,
      vatDue,
      createdBy: 'system'
    }
  });
}

async function createBankTransaction(orgId, data) {
  return prisma.bankTransaction.create({
    data: {
      organizationId: orgId,
      date: data.date,
      description: data.description,
      reference: data.reference,
      amount: data.amount,
      type: data.type,
      status: 'UNRECONCILED',
      accountId: data.accountId,
      createdBy: 'system'
    }
  });
}

async function createReconciliation(orgId, data) {
  const reconciliation = await prisma.reconciliation.create({
    data: {
      organizationId: orgId,
      date: data.date,
      reference: data.reference,
      description: data.description,
      status: 'IN_PROGRESS',
      accountId: data.accountId,
      createdBy: 'system'
    }
  });

  // Update bank transactions with reconciliation
  await Promise.all(
    data.transactions.map(txId =>
      prisma.bankTransaction.update({
        where: { id: txId },
        data: {
          reconciliationId: reconciliation.id,
          status: 'RECONCILED'
        }
      })
    )
  );

  return reconciliation;
}

main(); 