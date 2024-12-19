// src/features/medications/services/marService.ts

import { MARRepository } from '../database/marRepository';
import { 
  MAR,
  MAREntry,
  MedicationSchedule,
  Prisma
} from '@prisma/client';

export class MARService {
  private repository: MARRepository;

  constructor() {
    this.repository = new MARRepository();
  }

  async createMAR(
    residentId: string,
    medicationId: string,
    scheduleData: {
      frequency: string;
      times: string[];
      daysOfWeek: string[];
      instructions?: string;
    }
  ): Promise<MAR> {
    // First create the schedule
    const schedule = await this.repository.createSchedule({
      frequency: scheduleData.frequency,
      times: scheduleData.times,
      daysOfWeek: scheduleData.daysOfWeek,
      instructions: scheduleData.instructions
    });

    // Then create the MAR
    return this.repository.createMAR({
      resident: { connect: { id: residentId } },
      medication: { connect: { id: medicationId } },
      schedule: { connect: { id: schedule.id } },
      status: 'ACTIVE',
      startDate: new Date(),
    });
  }

  async recordAdministration(
    entryId: string,
    data: {
      administeredAt: Date;
      status: string;
      notes?: string;
      administeredBy: string;
      witnessedBy?: string;
    }
  ): Promise<MAREntry> {
    return this.repository.updateMAREntry(entryId, {
      administeredAt: data.administeredAt,
      status: data.status,
      notes: data.notes,
      administeredBy: data.administeredBy,
      witnessedBy: data.witnessedBy
    });
  }

  async generateEntries(
    marId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MAREntry[]> {
    const mar = await this.repository.getMARById(marId);
    if (!mar || !mar.schedule) {
      throw new Error('MAR or schedule not found');
    }

    const entries: Prisma.MAREntryCreateInput[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (mar.schedule.daysOfWeek.includes(dayOfWeek.toString())) {
        for (const time of mar.schedule.times) {
          const [hours, minutes] = time.split(':');
          const scheduledTime = new Date(currentDate);
          scheduledTime.setHours(parseInt(hours), parseInt(minutes));

          entries.push({
            mar: { connect: { id: marId } },
            scheduledTime,
            status: 'PENDING'
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Bulk create entries
    const createdEntries = await Promise.all(
      entries.map(entry => this.repository.createMAREntry(entry))
    );

    return createdEntries;
  }

  async discontinueMAR(
    marId: string,
    endDate: Date = new Date()
  ): Promise<MAR> {
    return this.repository.updateMARStatus(marId, 'DISCONTINUED', endDate);
  }
}


