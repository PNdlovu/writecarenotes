import { BedAssignment, BedStatus, Room } from '../types'

export const calculateRoomOccupancy = (room: Room) => {
    const totalBeds = room.beds.length
    const occupiedBeds = room.beds.filter(bed => bed.status === BedStatus.OCCUPIED).length
    return {
        occupancyRate: (occupiedBeds / totalBeds) * 100,
        availableBeds: totalBeds - occupiedBeds,
        totalBeds,
        occupiedBeds
    }
}

export const sortBedAssignments = (assignments: BedAssignment[]) => {
    return [...assignments].sort((a, b) => {
        // Sort by wing first
        if (a.bed.wing.name !== b.bed.wing.name) {
            return a.bed.wing.name.localeCompare(b.bed.wing.name)
        }
        // Then by room number
        if (a.bed.room.number !== b.bed.room.number) {
            return a.bed.room.number.localeCompare(b.bed.room.number)
        }
        // Finally by bed number
        return a.bed.number.localeCompare(b.bed.number)
    })
}

export const validateBedAssignment = (
    bedStatus: BedStatus,
    currentResidentId?: string,
    newResidentId?: string
) => {
    if (bedStatus === BedStatus.MAINTENANCE) {
        return {
            valid: false,
            error: 'Bed is under maintenance'
        }
    }

    if (bedStatus === BedStatus.OCCUPIED && currentResidentId) {
        return {
            valid: false,
            error: 'Bed is already occupied'
        }
    }

    if (currentResidentId === newResidentId) {
        return {
            valid: false,
            error: 'Resident is already assigned to this bed'
        }
    }

    return {
        valid: true,
        error: null
    }
}


