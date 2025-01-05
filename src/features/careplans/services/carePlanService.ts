import { prisma } from '@/lib/db'
import { storage } from '@/lib/storage'
import { 
    CarePlan, 
    CarePlanStatus,
    CarePlanTemplate,
    CarePlanAudit,
    CarePlanProgress,
    CarePlanReview,
    Region,
    RegulatoryBody,
    CarePlanFilters
} from '../types'
import { NotificationService } from '@/features/carehome/services/NotificationService'
import { ResidentService } from '@/features/carehome/services/ResidentService'
import { useTranslation } from 'react-i18next'

class CarePlanService {
    private notificationService: NotificationService
    private residentService: ResidentService
    private readonly STORAGE_KEY = 'carePlans'

    constructor() {
        this.notificationService = new NotificationService()
        this.residentService = new ResidentService()
    }

    // Offline storage methods
    private async getOfflineData<T>(key: string): Promise<T[]> {
        try {
            // Optimize storage for mobile devices
            const data = await storage.get<T[]>(key) || []
            
            // Implement data compression for mobile
            if (this.shouldCompressData()) {
                return this.decompressData(data)
            }
            
            return data
        } catch (error) {
            console.error(`Error retrieving offline data for ${key}:`, error)
            return []
        }
    }

    private async setOfflineData<T>(key: string, data: T[]): Promise<void> {
        try {
            // Implement data compression for mobile
            const storageData = this.shouldCompressData() ? this.compressData(data) : data
            
            // Implement storage quotas for mobile
            if (await this.checkStorageQuota(storageData)) {
                await storage.set(key, storageData)
            } else {
                await this.handleStorageQuotaExceeded()
            }
        } catch (error) {
            console.error(`Error setting offline data for ${key}:`, error)
            throw error
        }
    }

    private shouldCompressData(): boolean {
        // Check if we're on a mobile device or have limited storage
        return window.navigator.userAgent.includes('Mobile') || 
               window.navigator.storage?.estimate !== undefined
    }

    private async checkStorageQuota(data: any): Promise<boolean> {
        if (navigator.storage && navigator.storage.estimate) {
            const { usage, quota } = await navigator.storage.estimate()
            const dataSize = new Blob([JSON.stringify(data)]).size
            return (usage + dataSize) < quota
        }
        return true
    }

    private async handleStorageQuotaExceeded(): Promise<void> {
        // Clear old data based on priority
        const keys = ['templates', 'audits', this.STORAGE_KEY]
        for (const key of keys) {
            const data = await this.getOfflineData(key)
            if (data.length > 100) {
                // Keep only the most recent 100 items
                const sortedData = data.sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
                await this.setOfflineData(key, sortedData.slice(0, 100))
            }
        }
    }

    private compressData<T>(data: T[]): T[] {
        // Implement a basic compression strategy
        return data.map(item => {
            const compressed = { ...item }
            // Remove unnecessary whitespace from strings
            Object.entries(compressed).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    compressed[key] = value.trim()
                }
            })
            return compressed
        })
    }

    private decompressData<T>(data: T[]): T[] {
        // Reverse the compression process
        return data
    }

    // Mobile-optimized batch operations
    async batchSync(operations: Array<{ action: string, data: any }>): Promise<void> {
        const batchSize = 10 // Adjust based on mobile performance
        const batches = []
        
        for (let i = 0; i < operations.length; i += batchSize) {
            batches.push(operations.slice(i, i + batchSize))
        }

        for (const batch of batches) {
            try {
                await Promise.all(batch.map(op => this.processSyncOperation(op)))
            } catch (error) {
                console.error('Error in batch sync:', error)
                // Continue with next batch even if current fails
            }
        }
    }

    private async processSyncOperation({ action, data }: { action: string, data: any }): Promise<void> {
        switch (action) {
            case 'CREATE':
                await this.createCarePlan(data)
                break
            case 'UPDATE':
                await this.updateCarePlan(data.id, data.data, data.userId)
                break
            case 'APPROVE':
                await this.approveCarePlan(data.id, data.userId, data.notes)
                break
            default:
                console.warn(`Unknown sync operation: ${action}`)
        }
    }

    private async addToOfflineQueue(action: string, data: any): Promise<void> {
        const queue = await this.getOfflineData('syncQueue')
        queue.push({ action, data, timestamp: Date.now() })
        await this.setOfflineData('syncQueue', queue)
    }

    // Main methods with offline support
    async getCarePlan(id: string): Promise<CarePlan | null> {
        try {
            // Try offline storage first
            const offlinePlans = await this.getOfflineData<CarePlan>(this.STORAGE_KEY)
            const offlinePlan = offlinePlans.find(plan => plan.id === id)
            if (offlinePlan) return offlinePlan

            // If not found offline and online, fetch from server
            const plan = await prisma.carePlan.findUnique({
                where: { id },
                include: {
                    objectives: true,
                    interventions: true,
                    risks: true,
                    reviews: true,
                    progress: true
                }
            })

            if (plan) {
                // Cache the result
                await this.setOfflineData(this.STORAGE_KEY, [...offlinePlans, plan])
            }

            return plan
        } catch (error) {
            console.error('Error fetching care plan:', error)
            throw error
        }
    }

    async getCarePlansByServiceUser(serviceUserId: string): Promise<CarePlan[]> {
        try {
            // Try offline storage first
            const offlinePlans = await this.getOfflineData<CarePlan>(this.STORAGE_KEY)
            const offlinePlansByServiceUser = offlinePlans.filter(plan => plan.residentId === serviceUserId)
            if (offlinePlansByServiceUser.length > 0) return offlinePlansByServiceUser

            // If not found offline, fetch from server
            const plans = await prisma.carePlan.findMany({
                where: { residentId: serviceUserId },
                include: {
                    objectives: true,
                    interventions: true,
                    risks: true
                },
                orderBy: { startDate: 'desc' }
            })

            // Cache the result
            await this.setOfflineData(this.STORAGE_KEY, [...offlinePlans, ...plans])

            return plans
        } catch (error) {
            console.error('Error fetching care plans by service user:', error)
            throw error
        }
    }

    async getCarePlansByCareHome(careHomeId: string, filters: CarePlanFilters = {}): Promise<CarePlan[]> {
        try {
            // Try offline storage first
            const offlinePlans = await this.getOfflineData<CarePlan>(this.STORAGE_KEY)
            const offlinePlansByCareHome = offlinePlans.filter(plan => plan.careHomeId === careHomeId)
            if (offlinePlansByCareHome.length > 0) return offlinePlansByCareHome

            // If not found offline, fetch from server
            const plans = await prisma.carePlan.findMany({
                where: {
                    careHomeId,
                    ...filters
                },
                include: {
                    objectives: true,
                    interventions: true,
                    risks: true
                },
                orderBy: { startDate: 'desc' }
            })

            // Cache the result
            await this.setOfflineData(this.STORAGE_KEY, [...offlinePlans, ...plans])

            return plans
        } catch (error) {
            console.error('Error fetching care plans by care home:', error)
            throw error
        }
    }

    async getDueReviews(careHomeId: string): Promise<CarePlan[]> {
        try {
            // Try offline storage first
            const offlinePlans = await this.getOfflineData<CarePlan>(this.STORAGE_KEY)
            const offlineDueReviews = offlinePlans.filter(plan => 
                plan.careHomeId === careHomeId && 
                plan.status === CarePlanStatus.ACTIVE && 
                plan.nextReviewDate <= new Date()
            )
            if (offlineDueReviews.length > 0) return offlineDueReviews

            // If not found offline, fetch from server
            const plans = await prisma.carePlan.findMany({
                where: {
                    careHomeId,
                    status: CarePlanStatus.ACTIVE,
                    nextReviewDate: {
                        lte: new Date()
                    }
                },
                include: {
                    reviews: {
                        orderBy: {
                            reviewDate: 'desc'
                        },
                        take: 1
                    }
                }
            })

            // Cache the result
            await this.setOfflineData(this.STORAGE_KEY, [...offlinePlans, ...plans])

            return plans
        } catch (error) {
            console.error('Error fetching due reviews:', error)
            throw error
        }
    }

    async createCarePlan(
        data: Omit<CarePlan, 'id'>,
        templateId?: string
    ): Promise<CarePlan> {
        try {
            let planData = { ...data }

            if (templateId) {
                const template = await this.getTemplate(templateId)
                planData = this.applyTemplate(data, template)
            }

            // Apply regional requirements
            planData = this.applyRegionalRequirements(planData)

            const carePlan = await prisma.carePlan.create({
                data: planData,
                include: {
                    objectives: true,
                    interventions: true,
                    risks: true
                }
            })

            // Store offline
            const offlinePlans = await this.getOfflineData<CarePlan>(this.STORAGE_KEY)
            await this.setOfflineData(this.STORAGE_KEY, [...offlinePlans, carePlan])

            await this.createAudit({
                carePlanId: carePlan.id,
                action: 'CREATE',
                performedBy: data.primaryNurse,
                region: data.region
            })

            await this.notificationService.notifyStaff('CARE_PLAN_CREATED', {
                carePlanId: carePlan.id,
                residentId: carePlan.residentId
            })

            return carePlan
        } catch (error) {
            // If offline, queue for sync
            if (!navigator.onLine) {
                const offlineId = crypto.randomUUID()
                const offlinePlan = { ...data, id: offlineId }
                await this.addToOfflineQueue('CREATE', offlinePlan)
                return offlinePlan as CarePlan
            }
            throw error
        }
    }

    async updateCarePlan(
        id: string,
        data: Partial<CarePlan>,
        userId: string
    ): Promise<CarePlan> {
        try {
            const currentPlan = await this.getCarePlan(id)
            
            // Version control
            const updatedData = {
                ...data,
                version: currentPlan.version + 1
            }

            const carePlan = await prisma.carePlan.update({
                where: { id },
                data: updatedData,
                include: {
                    objectives: true,
                    interventions: true,
                    risks: true
                }
            })

            // Store offline
            const offlinePlans = await this.getOfflineData<CarePlan>(this.STORAGE_KEY)
            const updatedOfflinePlans = offlinePlans.map(plan => plan.id === id ? carePlan : plan)
            await this.setOfflineData(this.STORAGE_KEY, updatedOfflinePlans)

            await this.createAudit({
                carePlanId: id,
                action: 'UPDATE',
                performedBy: userId,
                changes: this.getChanges(currentPlan, carePlan)
            })

            return carePlan
        } catch (error) {
            // If offline, queue for sync
            if (!navigator.onLine) {
                await this.addToOfflineQueue('UPDATE', { id, data, userId })
                return currentPlan
            }
            throw error
        }
    }

    async recordProgress(data: Omit<CarePlanProgress, 'id'>): Promise<CarePlanProgress> {
        try {
            const progress = await prisma.carePlanProgress.create({
                data
            })

            // Store offline
            const offlineProgress = await this.getOfflineData<CarePlanProgress>('progress')
            await this.setOfflineData('progress', [...offlineProgress, progress])

            if (progress.followUpRequired) {
                await this.notificationService.notifyStaff('CARE_PLAN_FOLLOW_UP', {
                    carePlanId: progress.carePlanId,
                    progressId: progress.id,
                    notes: progress.followUpNotes
                })
            }

            return progress
        } catch (error) {
            // If offline, queue for sync
            if (!navigator.onLine) {
                const offlineId = crypto.randomUUID()
                const offlineProgress = { ...data, id: offlineId }
                await this.addToOfflineQueue('CREATE_PROGRESS', offlineProgress)
                return offlineProgress as CarePlanProgress
            }
            throw error
        }
    }

    async conductReview(data: Omit<CarePlanReview, 'id'>): Promise<CarePlanReview> {
        try {
            const review = await prisma.carePlanReview.create({
                data
            })

            // Store offline
            const offlineReviews = await this.getOfflineData<CarePlanReview>('reviews')
            await this.setOfflineData('reviews', [...offlineReviews, review])

            // Update care plan with next review date
            await this.updateCarePlan(
                review.carePlanId,
                {
                    lastReviewDate: review.reviewDate,
                    nextReviewDate: review.nextReviewDate
                },
                review.reviewedBy
            )

            if (review.outcome === 'MAJOR_CHANGES') {
                await this.notificationService.notifyStaff('CARE_PLAN_MAJOR_CHANGES', {
                    carePlanId: review.carePlanId,
                    reviewId: review.id
                })
            }

            return review
        } catch (error) {
            // If offline, queue for sync
            if (!navigator.onLine) {
                const offlineId = crypto.randomUUID()
                const offlineReview = { ...data, id: offlineId }
                await this.addToOfflineQueue('CREATE_REVIEW', offlineReview)
                return offlineReview as CarePlanReview
            }
            throw error
        }
    }

    async approveCarePlan(
        id: string,
        userId: string,
        notes?: string
    ): Promise<CarePlan> {
        try {
            const carePlan = await this.updateCarePlan(
                id,
                {
                    status: CarePlanStatus.ACTIVE,
                    approvedBy: userId,
                    approvedDate: new Date(),
                    notes
                },
                userId
            )

            await this.createAudit({
                carePlanId: id,
                action: 'APPROVE',
                performedBy: userId,
                reason: notes
            })

            return carePlan
        } catch (error) {
            // If offline, queue for sync
            if (!navigator.onLine) {
                await this.addToOfflineQueue('APPROVE', { id, userId, notes })
                return await this.getCarePlan(id)
            }
            throw error
        }
    }

    async getTemplate(id: string): Promise<CarePlanTemplate> {
        try {
            // Try offline storage first
            const offlineTemplates = await this.getOfflineData<CarePlanTemplate>('templates')
            const offlineTemplate = offlineTemplates.find(template => template.id === id)
            if (offlineTemplate) return offlineTemplate

            // If not found offline, fetch from server
            const template = await prisma.carePlanTemplate.findUnique({
                where: { id }
            })

            // Cache the result
            await this.setOfflineData('templates', [...offlineTemplates, template])

            return template
        } catch (error) {
            console.error('Error fetching template:', error)
            throw error
        }
    }

    async getTemplates(careLevel?: string): Promise<CarePlanTemplate[]> {
        try {
            // Try offline storage first
            const offlineTemplates = await this.getOfflineData<CarePlanTemplate>('templates')
            const offlineTemplatesByCareLevel = offlineTemplates.filter(template => template.careLevel === careLevel)
            if (offlineTemplatesByCareLevel.length > 0) return offlineTemplatesByCareLevel

            // If not found offline, fetch from server
            const templates = await prisma.carePlanTemplate.findMany({
                where: careLevel ? { careLevel } : undefined,
                orderBy: { name: 'asc' }
            })

            // Cache the result
            await this.setOfflineData('templates', [...offlineTemplates, ...templates])

            return templates
        } catch (error) {
            console.error('Error fetching templates:', error)
            throw error
        }
    }

    async createTemplate(data: Omit<CarePlanTemplate, 'id'>): Promise<CarePlanTemplate> {
        try {
            const template = await prisma.carePlanTemplate.create({
                data
            })

            // Store offline
            const offlineTemplates = await this.getOfflineData<CarePlanTemplate>('templates')
            await this.setOfflineData('templates', [...offlineTemplates, template])

            return template
        } catch (error) {
            // If offline, queue for sync
            if (!navigator.onLine) {
                const offlineId = crypto.randomUUID()
                const offlineTemplate = { ...data, id: offlineId }
                await this.addToOfflineQueue('CREATE_TEMPLATE', offlineTemplate)
                return offlineTemplate as CarePlanTemplate
            }
            throw error
        }
    }

    async getResidents({
        careHomeId,
        careLevel,
        page = 1,
        limit = 20
    }: GetResidentsParams): Promise<PaginatedResponse<Resident>> {
        try {
            const skip = (page - 1) * limit
            
            const residents = await this.prisma.resident.findMany({
                where: {
                    careHomeId,
                    careLevel
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            })
            
            const total = await this.prisma.resident.count({
                where: {
                    careHomeId,
                    careLevel
                }
            })
            
            return {
                data: residents,
                meta: {
                    page,
                    limit,
                    total,
                    hasMore: skip + residents.length < total
                }
            }
        } catch (error) {
            throw new APIError('Failed to fetch residents', error)
        }
    }

    private async createAudit(data: Omit<CarePlanAudit, 'id'>): Promise<CarePlanAudit> {
        try {
            const audit = await prisma.carePlanAudit.create({
                data: {
                    ...data,
                    performedAt: new Date()
                }
            })

            // Store offline
            const offlineAudits = await this.getOfflineData<CarePlanAudit>('audits')
            await this.setOfflineData('audits', [...offlineAudits, audit])

            return audit
        } catch (error) {
            // If offline, queue for sync
            if (!navigator.onLine) {
                const offlineId = crypto.randomUUID()
                const offlineAudit = { ...data, id: offlineId }
                await this.addToOfflineQueue('CREATE_AUDIT', offlineAudit)
                return offlineAudit as CarePlanAudit
            }
            throw error
        }
    }

    private applyTemplate(
        data: Omit<CarePlan, 'id'>,
        template: CarePlanTemplate
    ): Omit<CarePlan, 'id'> {
        return {
            ...data,
            objectives: [...template.defaultObjectives],
            interventions: [...template.defaultInterventions],
            risks: [...template.defaultRisks],
            reviewFrequency: template.reviewFrequency
        }
    }

    private getChanges(oldPlan: CarePlan, newPlan: CarePlan): Record<string, any> {
        const changes: Record<string, any> = {}
        
        Object.keys(newPlan).forEach(key => {
            if (JSON.stringify(oldPlan[key]) !== JSON.stringify(newPlan[key])) {
                changes[key] = {
                    from: oldPlan[key],
                    to: newPlan[key]
                }
            }
        })
        
        return changes
    }

    // Regional support methods
    private applyRegionalRequirements(data: Omit<CarePlan, 'id'>): Omit<CarePlan, 'id'> {
        const { region } = data

        // Add region-specific requirements
        switch (region) {
            case Region.ENGLAND:
                return this.applyCQCRequirements(data)
            case Region.SCOTLAND:
                return this.applyCareInspectorateRequirements(data)
            case Region.WALES:
                return this.applyCIWRequirements(data)
            case Region.NORTHERN_IRELAND:
                return this.applyRQIARequirements(data)
            case Region.IRELAND:
                return this.applyHIQARequirements(data)
            default:
                return data
        }
    }

    private applyCQCRequirements(data: Omit<CarePlan, 'id'>): Omit<CarePlan, 'id'> {
        return {
            ...data,
            regulatoryCompliance: {
                ...data.regulatoryCompliance,
                regulatoryBody: RegulatoryBody.CQC,
                requirements: [
                    // CQC-specific requirements
                    ...(data.regulatoryCompliance?.requirements || [])
                ]
            }
        }
    }

    private applyCareInspectorateRequirements(data: Omit<CarePlan, 'id'>): Omit<CarePlan, 'id'> {
        return {
            ...data,
            regulatoryCompliance: {
                ...data.regulatoryCompliance,
                regulatoryBody: RegulatoryBody.CARE_INSPECTORATE,
                requirements: [
                    // Care Inspectorate specific requirements
                    ...(data.regulatoryCompliance?.requirements || [])
                ]
            }
        }
    }

    private applyCIWRequirements(data: Omit<CarePlan, 'id'>): Omit<CarePlan, 'id'> {
        return {
            ...data,
            regulatoryCompliance: {
                ...data.regulatoryCompliance,
                regulatoryBody: RegulatoryBody.CIW,
                requirements: [
                    // CIW specific requirements
                    ...(data.regulatoryCompliance?.requirements || [])
                ]
            }
        }
    }

    private applyRQIARequirements(data: Omit<CarePlan, 'id'>): Omit<CarePlan, 'id'> {
        return {
            ...data,
            regulatoryCompliance: {
                ...data.regulatoryCompliance,
                regulatoryBody: RegulatoryBody.RQIA,
                requirements: [
                    // RQIA specific requirements
                    ...(data.regulatoryCompliance?.requirements || [])
                ]
            }
        }
    }

    private applyHIQARequirements(data: Omit<CarePlan, 'id'>): Omit<CarePlan, 'id'> {
        return {
            ...data,
            regulatoryCompliance: {
                ...data.regulatoryCompliance,
                regulatoryBody: RegulatoryBody.HIQA,
                requirements: [
                    // HIQA specific requirements
                    ...(data.regulatoryCompliance?.requirements || [])
                ]
            }
        }
    }
}

export default new CarePlanService()


