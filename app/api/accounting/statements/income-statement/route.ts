/**
 * @fileoverview Income Statement API Route
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Get all revenue and expense accounts
    const accounts = await prisma.account.findMany({
      where: {
        organizationId,
        type: {
          in: ['REVENUE', 'EXPENSE']
        },
        isActive: true
      },
      include: {
        entries: {
          where: {
            journalEntry: {
              date: {
                gte: startDate,
                lte: endDate
              },
              status: 'POSTED'
            }
          }
        }
      }
    });

    // Calculate income statement
    const incomeStatement = {
      revenue: {
        items: [],
        total: 0
      },
      expenses: {
        items: [],
        total: 0
      },
      grossProfit: 0,
      netIncome: 0
    };

    accounts.forEach(account => {
      const balance = account.entries.reduce(
        (sum, entry) => sum + (entry.credit || 0) - (entry.debit || 0),
        0
      );

      const accountData = {
        id: account.id,
        code: account.code,
        name: account.name,
        balance: Math.abs(balance)
      };

      if (account.type === 'REVENUE') {
        incomeStatement.revenue.items.push(accountData);
        incomeStatement.revenue.total += balance;
      } else {
        incomeStatement.expenses.items.push(accountData);
        incomeStatement.expenses.total += Math.abs(balance);
      }
    });

    incomeStatement.grossProfit = incomeStatement.revenue.total;
    incomeStatement.netIncome = incomeStatement.revenue.total - incomeStatement.expenses.total;

    return NextResponse.json({
      period: {
        startDate,
        endDate
      },
      incomeStatement
    });
  } catch (error) {
    console.error('Error generating income statement:', error);
    return NextResponse.json({ error: 'Failed to generate income statement' }, { status: 500 });
  }
} 
