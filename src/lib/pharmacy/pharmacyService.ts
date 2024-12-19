import { db } from '@/lib/db';
import { eq, and, lt, gt } from 'drizzle-orm';
import { medications, medicationInventory } from '@/lib/db/schema/medication';

export interface PharmacyOrder {
  id: string;
  medicationId: number;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  receivedDate?: Date;
  lotNumber?: string;
  expiryDate?: Date;
  pharmacyReference?: string;
  notes?: string;
}

export interface InventoryItem {
  id: number;
  medicationId: number;
  quantity: number;
  lotNumber: string;
  expiryDate: Date;
  location?: string;
  status: 'AVAILABLE' | 'LOW' | 'EXPIRED' | 'DISPOSED';
}

export interface InventoryMovement {
  id: number;
  inventoryId: number;
  type: 'RECEIVED' | 'ADMINISTERED' | 'DISPOSED' | 'ADJUSTED';
  quantity: number;
  remainingQuantity: number;
  performedBy: number;
  witnessId?: number;
  notes?: string;
  timestamp: Date;
}

export class PharmacyService {
  static async checkLowStock(threshold: number = 7) { // Days of supply
    const medications = await db.query.medications.findMany({
      where: and(
        eq(medications.active, true),
        eq(medications.autoReorder, true)
      ),
      with: {
        inventory: {
          where: eq(medicationInventory.status, 'AVAILABLE'),
        },
      }
    });

    const lowStockItems = [];
    for (const med of medications) {
      const totalStock = med.inventory.reduce((sum, item) => sum + item.quantity, 0);
      const dailyUsage = await this.calculateDailyUsage(med.id);
      const daysOfSupply = totalStock / (dailyUsage || 1);

      if (daysOfSupply < threshold) {
        lowStockItems.push({
          medicationId: med.id,
          name: med.name,
          currentStock: totalStock,
          daysOfSupply,
          recommendedOrder: Math.ceil((threshold - daysOfSupply) * dailyUsage)
        });
      }
    }

    return lowStockItems;
  }

  static async calculateDailyUsage(medicationId: number): Promise<number> {
    // Calculate average daily usage over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await db.query.medicationInventory.findMany({
      where: and(
        eq(medicationInventory.medicationId, medicationId),
        eq(medicationInventory.type, 'ADMINISTERED'),
        gt(medicationInventory.timestamp, thirtyDaysAgo)
      )
    });

    const totalUsage = movements.reduce((sum, movement) => sum + movement.quantity, 0);
    return totalUsage / 30; // Average daily usage
  }

  static async createOrder(
    medicationId: number,
    quantity: number,
    notes?: string
  ): Promise<PharmacyOrder> {
    const medication = await db.query.medications.findFirst({
      where: eq(medications.id, medicationId),
    });

    if (!medication) {
      throw new Error('Medication not found');
    }

    const order = await db.insert(pharmacyOrders).values({
      medicationId,
      quantity,
      status: 'PENDING',
      orderDate: new Date(),
      notes,
    }).returning();

    // Create notification for pharmacy order
    await db.insert(notifications).values({
      type: 'PHARMACY_ORDER',
      status: 'PENDING',
      priority: 'MEDIUM',
      title: 'New Pharmacy Order',
      message: `New order created for ${medication.name} (Qty: ${quantity})`,
      metadata: {
        orderId: order[0].id,
        medicationId,
        quantity,
      },
    });

    return order[0];
  }

  static async receiveOrder(
    orderId: string,
    {
      quantity,
      lotNumber,
      expiryDate,
      location,
    }: {
      quantity: number;
      lotNumber: string;
      expiryDate: Date;
      location?: string;
    }
  ) {
    const order = await db.query.pharmacyOrders.findFirst({
      where: eq(pharmacyOrders.id, orderId),
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Begin transaction
    return await db.transaction(async (tx) => {
      // Update order status
      await tx
        .update(pharmacyOrders)
        .set({
          status: 'RECEIVED',
          receivedDate: new Date(),
          lotNumber,
        })
        .where(eq(pharmacyOrders.id, orderId));

      // Create inventory entry
      const inventory = await tx
        .insert(medicationInventory)
        .values({
          medicationId: order.medicationId,
          quantity,
          lotNumber,
          expiryDate,
          location,
          status: 'AVAILABLE',
        })
        .returning();

      // Create inventory movement record
      await tx.insert(inventoryMovements).values({
        inventoryId: inventory[0].id,
        type: 'RECEIVED',
        quantity,
        remainingQuantity: quantity,
        performedBy: session.user.id,
        notes: `Received from order ${orderId}`,
        timestamp: new Date(),
      });

      return inventory[0];
    });
  }

  static async recordAdministration(
    inventoryId: number,
    quantity: number,
    residentId: string,
    administeredBy: number,
    witnessId?: number,
    notes?: string
  ) {
    // Get available inventory items, ordered by expiry date
    const inventoryItems = await db.query.medicationInventory.findMany({
      where: and(
        eq(medicationInventory.medicationId, inventoryId),
        eq(medicationInventory.status, 'AVAILABLE'),
        gt(medicationInventory.quantity, 0)
      ),
      orderBy: asc(medicationInventory.expiryDate),
    });

    if (!inventoryItems.length) {
      throw new Error('No inventory available for this medication');
    }

    let remainingQuantity = quantity;
    const updates = [];

    // Begin transaction
    return await db.transaction(async (tx) => {
      for (const item of inventoryItems) {
        if (remainingQuantity <= 0) break;

        const quantityToDeduct = Math.min(remainingQuantity, item.quantity);
        const newQuantity = item.quantity - quantityToDeduct;

        // Update inventory quantity
        await tx
          .update(medicationInventory)
          .set({
            quantity: newQuantity,
            status: newQuantity === 0 ? 'DISPOSED' : 'AVAILABLE',
          })
          .where(eq(medicationInventory.id, item.id));

        // Create inventory movement record
        await tx.insert(inventoryMovements).values({
          inventoryId: item.id,
          type: 'ADMINISTERED',
          quantity: quantityToDeduct,
          remainingQuantity: newQuantity,
          performedBy: administeredBy,
          witnessId,
          notes: `Administration ID: ${residentId}`,
          timestamp: new Date(),
        });

        remainingQuantity -= quantityToDeduct;
        updates.push({
          inventoryId: item.id,
          quantityUsed: quantityToDeduct,
        });
      }

      if (remainingQuantity > 0) {
        throw new Error('Insufficient inventory available');
      }

      return updates;
    });
  }

  static async checkExpiringMedications(daysThreshold: number = 30) {
    const expiryDate = addDays(new Date(), daysThreshold);

    const expiringItems = await db.query.medicationInventory.findMany({
      where: and(
        eq(medicationInventory.status, 'AVAILABLE'),
        gt(medicationInventory.quantity, 0),
        lt(medicationInventory.expiryDate, expiryDate)
      ),
      with: {
        medication: true,
      },
      orderBy: asc(medicationInventory.expiryDate),
    });

    // Create notifications for expiring medications
    for (const item of expiringItems) {
      await db.insert(notifications).values({
        type: 'MEDICATION_EXPIRY',
        status: 'PENDING',
        priority: 'HIGH',
        title: 'Medication Expiring Soon',
        message: `${item.medication.name} (Lot: ${item.lotNumber}) expires on ${format(
          item.expiryDate,
          'MMM d, yyyy'
        )}`,
        metadata: {
          medicationId: item.medicationId,
          inventoryId: item.id,
          expiryDate: item.expiryDate.toISOString(),
        },
      });
    }

    return expiringItems;
  }
}
