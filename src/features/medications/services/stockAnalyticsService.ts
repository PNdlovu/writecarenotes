/**
 * @writecarenotes.com
 * @fileoverview Stock analytics service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for analyzing medication stock data and generating reports
 * including usage trends, wastage analysis, and cost tracking.
 */

import { db } from '@/lib/db';
import type { 
  StockAnalytics, 
  UsageTrend, 
  WastageReport, 
  CostAnalysis,
  ExpiryForecast 
} from '../types/stockAnalytics';

export class StockAnalyticsService {
  /**
   * Get usage trends for a medication
   */
  async getUsageTrends(
    medicationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageTrend[]> {
    const transactions = await db.stockTransaction.findMany({
      where: {
        stock: {
          medicationId,
        },
        type: 'ADMINISTRATION',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day and calculate usage
    const trends = transactions.reduce((acc, transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      const existing = acc.find(t => t.date === date);
      
      if (existing) {
        existing.quantity += Math.abs(transaction.quantity);
      } else {
        acc.push({
          date,
          quantity: Math.abs(transaction.quantity),
        });
      }
      
      return acc;
    }, [] as UsageTrend[]);

    return trends;
  }

  /**
   * Get wastage report
   */
  async getWastageReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WastageReport[]> {
    const transactions = await db.stockTransaction.findMany({
      where: {
        organizationId,
        type: 'ADJUSTMENT',
        quantity: {
          lt: 0,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        stock: {
          include: {
            medication: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by medication and calculate wastage
    const wastage = transactions.reduce((acc, transaction) => {
      const medicationId = transaction.stock.medicationId;
      const existing = acc.find(w => w.medicationId === medicationId);
      
      if (existing) {
        existing.quantity += Math.abs(transaction.quantity);
        existing.instances += 1;
      } else {
        acc.push({
          medicationId,
          medicationName: transaction.stock.medication.name,
          quantity: Math.abs(transaction.quantity),
          instances: 1,
          reasons: [transaction.reason || 'No reason provided'],
        });
      }
      
      return acc;
    }, [] as WastageReport[]);

    return wastage;
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CostAnalysis[]> {
    const transactions = await db.stockTransaction.findMany({
      where: {
        organizationId,
        type: {
          in: ['RECEIPT', 'ADJUSTMENT', 'ADMINISTRATION'],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        stock: {
          include: {
            medication: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by medication and calculate costs
    const costs = transactions.reduce((acc, transaction) => {
      const medicationId = transaction.stock.medicationId;
      const existing = acc.find(c => c.medicationId === medicationId);
      const cost = transaction.stock.medication.unitCost || 0;
      
      if (existing) {
        if (transaction.type === 'RECEIPT') {
          existing.purchaseCost += Math.abs(transaction.quantity) * cost;
          existing.receivedQuantity += Math.abs(transaction.quantity);
        } else {
          existing.usageCost += Math.abs(transaction.quantity) * cost;
          existing.usedQuantity += Math.abs(transaction.quantity);
        }
      } else {
        acc.push({
          medicationId,
          medicationName: transaction.stock.medication.name,
          purchaseCost: transaction.type === 'RECEIPT' ? Math.abs(transaction.quantity) * cost : 0,
          usageCost: transaction.type !== 'RECEIPT' ? Math.abs(transaction.quantity) * cost : 0,
          receivedQuantity: transaction.type === 'RECEIPT' ? Math.abs(transaction.quantity) : 0,
          usedQuantity: transaction.type !== 'RECEIPT' ? Math.abs(transaction.quantity) : 0,
        });
      }
      
      return acc;
    }, [] as CostAnalysis[]);

    return costs;
  }

  /**
   * Get expiry forecast
   */
  async getExpiryForecast(
    organizationId: string,
    daysThreshold: number = 90
  ): Promise<ExpiryForecast[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const stock = await db.medicationStock.findMany({
      where: {
        organizationId,
        quantity: {
          gt: 0,
        },
      },
      include: {
        medication: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    const forecast = stock.map(item => {
      const daysToExpiry = Math.ceil(
        (new Date(item.expiryDate).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      return {
        medicationId: item.medicationId,
        medicationName: item.medication.name,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        expiryDate: item.expiryDate.toISOString(),
        daysToExpiry,
        estimatedLoss: item.quantity * (item.medication.unitCost || 0),
      };
    });

    return forecast;
  }

  /**
   * Get complete stock analytics
   */
  async getStockAnalytics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockAnalytics> {
    const [wastage, costs, forecast] = await Promise.all([
      this.getWastageReport(organizationId, startDate, endDate),
      this.getCostAnalysis(organizationId, startDate, endDate),
      this.getExpiryForecast(organizationId),
    ]);

    // Calculate summary statistics
    const totalWastage = wastage.reduce((sum, w) => sum + w.quantity, 0);
    const totalCost = costs.reduce((sum, c) => sum + c.purchaseCost, 0);
    const potentialLoss = forecast
      .filter(f => f.daysToExpiry <= 90)
      .reduce((sum, f) => sum + f.estimatedLoss, 0);

    return {
      summary: {
        totalWastage,
        totalCost,
        potentialLoss,
        wastagePercentage: totalWastage / costs.reduce((sum, c) => sum + c.receivedQuantity, 0) * 100,
      },
      wastage,
      costs,
      forecast,
    };
  }
} 