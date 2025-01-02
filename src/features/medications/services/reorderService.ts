/**
 * @writecarenotes.com
 * @fileoverview Automated reordering service for medication stock
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive service for managing automated medication reordering,
 * including reorder rules, purchase orders, and supplier integration.
 */

import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';
import { NotificationService } from '@/lib/notifications';
import type {
  ReorderRule,
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  ReorderRuleCreateInput,
  PurchaseOrderCreateInput,
  OrderStatus,
} from '../types/stock';
import { format, addBusinessDays } from 'date-fns';

export class ReorderService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Reorder Rule Management
   */
  async createReorderRule(
    data: ReorderRuleCreateInput
  ): Promise<ReorderRule> {
    const rule = await db.reorderRule.create({
      data,
      include: {
        supplier: true,
      },
    });

    await addToSyncQueue({
      type: 'CREATE',
      entity: 'reorderRule',
      data: rule,
    });

    return rule;
  }

  async updateReorderRule(
    id: string,
    data: Partial<ReorderRule>
  ): Promise<ReorderRule> {
    const rule = await db.reorderRule.update({
      where: { id },
      data,
      include: {
        supplier: true,
      },
    });

    await addToSyncQueue({
      type: 'UPDATE',
      entity: 'reorderRule',
      data: rule,
    });

    return rule;
  }

  async getReorderRule(
    medicationId: string,
    organizationId: string
  ): Promise<ReorderRule | null> {
    return db.reorderRule.findFirst({
      where: {
        medicationId,
        organizationId,
      },
      include: {
        supplier: true,
      },
    });
  }

  async getReorderRules(
    organizationId: string,
    medicationId?: string
  ): Promise<ReorderRule[]> {
    return db.reorderRule.findMany({
      where: {
        organizationId,
        ...(medicationId && { medicationId }),
      },
      include: {
        supplier: true,
      },
    });
  }

  /**
   * Purchase Order Management
   */
  async createOrder(
    organizationId: string,
    data: PurchaseOrderCreateInput
  ): Promise<PurchaseOrder> {
    const order = await db.purchaseOrder.create({
      data: {
        ...data,
        organizationId,
        status: 'PENDING',
      },
      include: {
        items: true,
        supplier: true,
      },
    });

    await addToSyncQueue({
      type: 'CREATE',
      entity: 'purchaseOrder',
      data: order,
    });

    // Notify relevant staff
    await this.notificationService.sendAlert({
      type: 'PURCHASE_ORDER_CREATED',
      organizationId,
      message: `New purchase order created: ${order.orderNumber}`,
      data: order,
    });

    return order;
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    notes?: string
  ): Promise<PurchaseOrder> {
    const order = await db.purchaseOrder.update({
      where: { id },
      data: {
        status,
        notes: notes ? {
          push: {
            content: notes,
            timestamp: new Date(),
          },
        } : undefined,
      },
      include: {
        items: true,
        supplier: true,
      },
    });

    await addToSyncQueue({
      type: 'UPDATE',
      entity: 'purchaseOrder',
      data: order,
    });

    // Notify relevant staff
    await this.notificationService.sendAlert({
      type: 'PURCHASE_ORDER_UPDATED',
      organizationId: order.organizationId,
      message: `Purchase order ${order.orderNumber} status updated to ${status}`,
      data: order,
    });

    return order;
  }

  async getPurchaseOrders(
    organizationId: string,
    options?: {
      status?: OrderStatus;
      supplierId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<PurchaseOrder[]> {
    return db.purchaseOrder.findMany({
      where: {
        organizationId,
        ...(options?.status && { status: options.status }),
        ...(options?.supplierId && { supplierId: options.supplierId }),
        ...(options?.startDate && options?.endDate && {
          createdAt: {
            gte: options.startDate,
            lte: options.endDate,
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.offset || 0,
      take: options?.limit || 50,
      include: {
        items: true,
        supplier: true,
      },
    });
  }

  /**
   * Automated Reordering
   */
  async checkAndCreateOrders(organizationId: string): Promise<PurchaseOrder[]> {
    const rules = await this.getReorderRules(organizationId);
    const orders: PurchaseOrder[] = [];

    // Group rules by supplier
    const rulesBySupplier = rules.reduce((acc, rule) => {
      if (!rule.supplierId) return acc;
      if (!acc[rule.supplierId]) {
        acc[rule.supplierId] = [];
      }
      acc[rule.supplierId].push(rule);
      return acc;
    }, {} as Record<string, ReorderRule[]>);

    // Create orders for each supplier
    for (const [supplierId, supplierRules] of Object.entries(rulesBySupplier)) {
      const items: PurchaseOrderItem[] = [];

      // Check stock levels for each rule
      for (const rule of supplierRules) {
        const stock = await db.medicationStock.findFirst({
          where: {
            medicationId: rule.medicationId,
            organizationId,
          },
        });

        if (stock && stock.quantity <= rule.reorderLevel && rule.autoReorder) {
          items.push({
            medicationId: rule.medicationId,
            quantity: rule.orderQuantity || this.calculateOrderQuantity(rule, stock.quantity),
            notes: `Auto-reorder triggered at quantity ${stock.quantity}`,
          });
        }
      }

      // Create order if there are items to order
      if (items.length > 0) {
        const order = await this.createOrder(organizationId, {
          supplierId,
          items,
          orderNumber: await this.generateOrderNumber(organizationId),
          expectedDeliveryDate: addBusinessDays(new Date(), 5).toISOString(),
          notes: 'Automated reorder',
        });

        orders.push(order);
      }
    }

    return orders;
  }

  /**
   * Supplier Management
   */
  async getSuppliers(organizationId: string): Promise<Supplier[]> {
    return db.supplier.findMany({
      where: { organizationId },
      include: {
        activeOrders: {
          where: {
            status: {
              in: ['PENDING', 'APPROVED', 'ORDERED'],
            },
          },
        },
      },
    });
  }

  /**
   * Helper Methods
   */
  private async generateOrderNumber(organizationId: string): Promise<string> {
    const date = format(new Date(), 'yyyyMMdd');
    const count = await db.purchaseOrder.count({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return `PO-${date}-${(count + 1).toString().padStart(3, '0')}`;
  }

  private calculateOrderQuantity(rule: ReorderRule, currentQuantity: number): number {
    const deficit = rule.targetLevel - currentQuantity;
    const minOrder = rule.minimumOrderQuantity || 1;
    const orderQuantity = Math.max(deficit, minOrder);
    
    // Round up to the nearest pack size if specified
    if (rule.packSize) {
      return Math.ceil(orderQuantity / rule.packSize) * rule.packSize;
    }

    return orderQuantity;
  }
} 