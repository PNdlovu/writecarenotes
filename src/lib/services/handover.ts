/**
 * @fileoverview Server-side handover service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { HandoverNote, HandoverSession, HandoverTask, HandoverAttachment, ComplianceStatus } from '@/features/schedule/types/handover';

export class HandoverService {
  /**
   * Get handovers for a care home
   */
  async getHandovers(organizationId: string, careHomeId: string) {
    return prisma.handoverSession.findMany({
      where: {
        organizationId,
        careHomeId
      },
      include: {
        notes: true,
        tasks: true,
        attachments: true,
        outgoingStaff: true,
        incomingStaff: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Create a new handover session
   */
  async createHandover(data: {
    organizationId: string;
    careHomeId: string;
    shiftId: string;
    outgoingStaffIds: string[];
    incomingStaffIds: string[];
  }) {
    return prisma.handoverSession.create({
      data: {
        organizationId: data.organizationId,
        careHomeId: data.careHomeId,
        shiftId: data.shiftId,
        status: 'IN_PROGRESS',
        outgoingStaff: {
          connect: data.outgoingStaffIds.map(id => ({ id }))
        },
        incomingStaff: {
          connect: data.incomingStaffIds.map(id => ({ id }))
        }
      },
      include: {
        outgoingStaff: true,
        incomingStaff: true
      }
    });
  }

  /**
   * Get a handover session by ID
   */
  async getHandover(id: string) {
    return prisma.handoverSession.findUnique({
      where: { id },
      include: {
        notes: true,
        tasks: true,
        attachments: true,
        outgoingStaff: true,
        incomingStaff: true
      }
    });
  }

  /**
   * Update a handover session
   */
  async updateHandover(id: string, data: Partial<HandoverSession>) {
    return prisma.handoverSession.update({
      where: { id },
      data,
      include: {
        notes: true,
        tasks: true,
        attachments: true,
        outgoingStaff: true,
        incomingStaff: true
      }
    });
  }

  /**
   * Delete a handover session
   */
  async deleteHandover(id: string) {
    return prisma.handoverSession.delete({
      where: { id }
    });
  }
}

// Export a singleton instance
export const handoverService = new HandoverService(); 