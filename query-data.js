const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get the most recent organization
    const org = await prisma.organization.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('\n=== Organization ===');
    console.log(org);

    // Generate Trial Balance
    console.log('\n=== Trial Balance ===');
    const journalLines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          organizationId: org.id,
          status: 'POSTED'
        }
      },
      include: {
        account: true,
        journalEntry: true
      }
    });

    const trialBalance = journalLines.reduce((acc, line) => {
      if (!acc[line.account.code]) {
        acc[line.account.code] = {
          accountCode: line.account.code,
          accountName: line.account.name,
          accountType: line.account.type,
          debitTotal: 0,
          creditTotal: 0
        };
      }
      acc[line.account.code].debitTotal += line.debit || 0;
      acc[line.account.code].creditTotal += line.credit || 0;
      return acc;
    }, {});

    Object.values(trialBalance).forEach(account => {
      console.log(`${account.accountCode} - ${account.accountName}`);
      console.log(`  Type: ${account.accountType}`);
      console.log(`  Debit: £${account.debitTotal.toFixed(2)}`);
      console.log(`  Credit: £${account.creditTotal.toFixed(2)}`);
      console.log(`  Balance: £${(account.debitTotal - account.creditTotal).toFixed(2)}`);
      console.log('---');
    });

    // VAT Analysis
    console.log('\n=== VAT Analysis ===');
    const vatTransactions = await prisma.journalEntryLine.findMany({
      where: {
        account: {
          code: '2200', // VAT account
          organizationId: org.id
        }
      },
      include: {
        journalEntry: true,
        costCenter: true
      }
    });

    const vatSummary = {
      totalVATCharged: 0,
      totalVATPaid: 0,
      netVATPayable: 0
    };

    vatTransactions.forEach(transaction => {
      vatSummary.totalVATCharged += transaction.credit || 0;
      vatSummary.totalVATPaid += transaction.debit || 0;
    });
    vatSummary.netVATPayable = vatSummary.totalVATCharged - vatSummary.totalVATPaid;

    console.log('VAT Summary:');
    console.log(`  Total VAT Charged: £${vatSummary.totalVATCharged.toFixed(2)}`);
    console.log(`  Total VAT Paid: £${vatSummary.totalVATPaid.toFixed(2)}`);
    console.log(`  Net VAT Payable: £${vatSummary.netVATPayable.toFixed(2)}`);

    // Cost Center Analysis
    console.log('\n=== Cost Center Analysis ===');
    const costCenterTransactions = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          organizationId: org.id,
          status: 'POSTED'
        }
      },
      include: {
        costCenter: true,
        account: true,
        journalEntry: true
      }
    });

    const costCenterSummary = costCenterTransactions.reduce((acc, line) => {
      if (!line.costCenter) return acc;
      
      if (!acc[line.costCenter.code]) {
        acc[line.costCenter.code] = {
          name: line.costCenter.name,
          revenue: 0,
          expenses: 0
        };
      }

      if (line.account.type === 'REVENUE') {
        acc[line.costCenter.code].revenue += line.credit || 0;
      } else if (line.account.type === 'EXPENSE') {
        acc[line.costCenter.code].expenses += line.debit || 0;
      }

      return acc;
    }, {});

    Object.entries(costCenterSummary).forEach(([code, data]) => {
      console.log(`${code} - ${data.name}`);
      console.log(`  Revenue: £${data.revenue.toFixed(2)}`);
      console.log(`  Expenses: £${data.expenses.toFixed(2)}`);
      console.log(`  Net: £${(data.revenue - data.expenses).toFixed(2)}`);
      console.log('---');
    });

    // Bank Reconciliation Status
    console.log('\n=== Bank Reconciliation Status ===');
    const bankReconciliation = await prisma.reconciliation.findFirst({
      where: { organizationId: org.id },
      include: {
        transactions: true
      }
    });

    if (bankReconciliation) {
      console.log(`Reconciliation: ${bankReconciliation.reference}`);
      console.log(`Status: ${bankReconciliation.status}`);
      console.log(`Number of Transactions: ${bankReconciliation.transactions.length}`);
      
      const reconciled = bankReconciliation.transactions.filter(t => t.status === 'RECONCILED').length;
      const unreconciled = bankReconciliation.transactions.filter(t => t.status === 'UNRECONCILED').length;
      
      console.log(`Reconciled Transactions: ${reconciled}`);
      console.log(`Unreconciled Transactions: ${unreconciled}`);
    }

    // Audit Trail
    console.log('\n=== Recent Audit Trail ===');
    const auditTrail = await prisma.auditLog.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    auditTrail.forEach(log => {
      console.log(`${log.createdAt.toISOString()} - ${log.entityType} - ${log.action}`);
      console.log(`Details:`, log.details);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 