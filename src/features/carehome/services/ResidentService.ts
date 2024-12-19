import { prisma } from '@/lib/db'
import { 
    Resident, 
    ResidentStatus, 
    ResidentActivity, 
    ResidentIncident,
    ResidentAssessment
} from '../types/resident'
import { CareLevel } from '../types/care'
import { NotificationService } from './NotificationService'
import { DataExportService } from './DataExportService'

export class ResidentService {
    private notificationService: NotificationService
    private dataExportService: DataExportService

    constructor() {
        this.notificationService = new NotificationService()
        this.dataExportService = new DataExportService()
    }

    async getResident(id: string): Promise<Resident> {
        return prisma.resident.findUnique({
            where: { id },
            include: {
                contacts: true,
                assessments: true,
                activities: true,
                incidents: true,
                room: true
            }
        })
    }

    async getResidentsByStatus(
        careHomeId: string,
        status: ResidentStatus
    ): Promise<Resident[]> {
        return prisma.resident.findMany({
            where: { 
                careHomeId,
                status 
            },
            include: {
                contacts: true,
                room: true
            }
        })
    }

    async getResidentsByCareLevel(
        careHomeId: string,
        careLevel: CareLevel
    ): Promise<Resident[]> {
        return prisma.resident.findMany({
            where: {
                careHomeId,
                careLevel
            },
            include: {
                contacts: true,
                room: true
            }
        })
    }

    async admitResident(data: Omit<Resident, 'id'>): Promise<Resident> {
        const resident = await prisma.resident.create({
            data: {
                ...data,
                status: ResidentStatus.ACTIVE
            },
            include: {
                contacts: true
            }
        })

        await this.notificationService.notifyStaff('NEW_ADMISSION', {
            residentId: resident.id,
            residentName: `${resident.firstName} ${resident.lastName}`
        })

        return resident
    }

    async updateResident(
        id: string,
        data: Partial<Resident>
    ): Promise<Resident> {
        return prisma.resident.update({
            where: { id },
            data,
            include: {
                contacts: true
            }
        })
    }

    async dischargeResident(
        id: string,
        reason: string,
        date: Date
    ): Promise<Resident> {
        const resident = await prisma.resident.update({
            where: { id },
            data: {
                status: ResidentStatus.DISCHARGED,
                dischargeDate: date,
                notes: `Discharged: ${reason}`
            }
        })

        await this.notificationService.notifyStaff('DISCHARGE', {
            residentId: resident.id,
            residentName: `${resident.firstName} ${resident.lastName}`,
            reason
        })

        return resident
    }

    async recordActivity(data: Omit<ResidentActivity, 'id'>): Promise<ResidentActivity> {
        return prisma.residentActivity.create({
            data
        })
    }

    async recordIncident(data: Omit<ResidentIncident, 'id'>): Promise<ResidentIncident> {
        const incident = await prisma.residentIncident.create({
            data
        })

        if (incident.severity === 'HIGH') {
            await this.notificationService.notifyStaff('SERIOUS_INCIDENT', {
                residentId: incident.residentId,
                incidentId: incident.id,
                description: incident.description
            })
        }

        return incident
    }

    async recordAssessment(data: Omit<ResidentAssessment, 'id'>): Promise<ResidentAssessment> {
        const assessment = await prisma.residentAssessment.create({
            data
        })

        // If care level has changed, notify relevant staff
        const resident = await this.getResident(data.residentId)
        if (resident.careLevel !== data.careLevel) {
            await this.notificationService.notifyStaff('CARE_LEVEL_CHANGE', {
                residentId: resident.id,
                residentName: `${resident.firstName} ${resident.lastName}`,
                previousLevel: resident.careLevel,
                newLevel: data.careLevel
            })
        }

        return assessment
    }

    async generateCareReport(residentId: string): Promise<Buffer> {
        const resident = await this.getResident(residentId)
        return this.dataExportService.generateResidentReport(resident)
    }

    async getResidentTimeline(
        residentId: string,
        startDate: Date,
        endDate: Date
    ): Promise<Array<{
        date: Date;
        type: string;
        details: any;
    }>> {
        const [activities, incidents, assessments] = await Promise.all([
            prisma.residentActivity.findMany({
                where: {
                    residentId,
                    date: { gte: startDate, lte: endDate }
                }
            }),
            prisma.residentIncident.findMany({
                where: {
                    residentId,
                    date: { gte: startDate, lte: endDate }
                }
            }),
            prisma.residentAssessment.findMany({
                where: {
                    residentId,
                    date: { gte: startDate, lte: endDate }
                }
            })
        ])

        return [...activities, ...incidents, ...assessments]
            .map(item => ({
                date: item.date,
                type: this.getTimelineItemType(item),
                details: item
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime())
    }

    private getTimelineItemType(item: any): string {
        if ('activityType' in item) return 'ACTIVITY'
        if ('severity' in item) return 'INCIDENT'
        if ('careLevel' in item) return 'ASSESSMENT'
        return 'OTHER'
    }
}

export default new ResidentService()


