/**
 * @fileoverview Balance Sheet API Route
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asOf = searchParams.get('asOf') ? new Date(searchParams.get('asOf')!) : new Date();
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Get all accounts
    const accounts = await prisma.account.findMany({
      where: {
        organizationId,
        type: {
          in: ['ASSET', 'LIABILITY', 'EQUITY']
        },
        isActive: true
      },
      include: {
        entries: {
          where: {
            journalEntry: {
              date: {
                lte: asOf
              },
              status: 'POSTED'
            }
          }
        }
      }
    });

    // Calculate balances
    const balanceSheet = {
      assets: {
        current: [],
        fixed: [],
        total: 0
      },
      liabilities: {
        current: [],
        longTerm: [],
        total: 0
      },
      equity: {
        items: [],
        total: 0
      }
    };

    accounts.forEach(account => {
      const balance = account.entries.reduce(
        (sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0),
        0
      );

      const accountData = {
        id: account.id,
        code: account.code,
        name: account.name,
        balance
      };

      switch (account.type) {
        case 'ASSET':
          if (account.category === 'CURRENT') {
            balanceSheet.assets.current.push(accountData);
          } else {
            balanceSheet.assets.fixed.push(accountData);
          }
          balanceSheet.assets.total += balance;
          break;

        case 'LIABILITY':
          if (account.category === 'CURRENT') {
            balanceSheet.liabilities.current.push(accountData);
          } else {
            balanceSheet.liabilities.longTerm.push(accountData);
          }
          balanceSheet.liabilities.total += balance;
          break;

        case 'EQUITY':
          balanceSheet.equity.items.push(accountData);
          balanceSheet.equity.total += balance;
          break;
      }
    });

    return NextResponse.json({
      asOf,
      balanceSheet,
      totalAssets: balanceSheet.assets.total,
      totalLiabilitiesAndEquity: balanceSheet.liabilities.total + balanceSheet.equity.total
    });
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    return NextResponse.json({ error: 'Failed to generate balance sheet' }, { status: 500 });
  }
} 