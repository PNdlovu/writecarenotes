import { prisma } from '@/lib/db'
import { BedAssignment, BedStatus, Room, Wing } from '../types'

export class BedManagementRepository {
    async getBedsByWing(wingId: string) {
        return prisma.bed.findMany({
            where: { wingId },
            include: {
                currentResident: true,
                room: true,
                wing: true,
            },
        })
    }

    async getBedAssignmentHistory(bedId: string) {
        return prisma.bedAssignment.findMany({
            where: { bedId },
            include: {
                resident: true,
                assignedBy: true,
            },
            orderBy: { assignedAt: 'desc' },
        })
    }

    async createBedAssignment(data: Omit<BedAssignment, 'id'>) {
        return prisma.bedAssignment.create({
            data,
            include: {
                resident: true,
                assignedBy: true,
            },
        })
    }

    async updateBedStatus(bedId: string, status: BedStatus) {
        return prisma.bed.update({
            where: { id: bedId },
            data: { status },
        })
    }

    async getRoomOccupancy(roomId: string) {
        return prisma.bed.findMany({
            where: { roomId },
            include: {
                currentResident: true,
            },
        })
    }

    async getWingCapacityStats(wingId: string) {
        const beds = await prisma.bed.findMany({
            where: { wingId },
            select: {
                status: true,
            },
        })

        return {
            total: beds.length,
            occupied: beds.filter(b => b.status === BedStatus.OCCUPIED).length,
            available: beds.filter(b => b.status === BedStatus.AVAILABLE).length,
            maintenance: beds.filter(b => b.status === BedStatus.MAINTENANCE).length,
        }
    }
}

export default new BedManagementRepository()


