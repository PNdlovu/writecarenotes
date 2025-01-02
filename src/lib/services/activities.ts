import { prisma } from '@/lib/prisma';
import { addDays, addWeeks, addMonths, isSameDay, parseISO } from 'date-fns';
import { 
  Activity,
  ActivitySession,
  ActivityParticipant,
  ActivityStatus,
  ActivityRecurrence,
  ActivityPreference,
  ActivityAchievement
} from '@/types/activities';

export class ActivitiesService {
  /**
   * Creates a new activity
   */
  async createActivity(data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    return prisma.activity.create({
      data: {
        ...data,
        materials: data.materials || [],
        objectives: data.objectives || [],
        adaptations: data.adaptations || []
      }
    });
  }

  /**
   * Updates an existing activity
   */
  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    return prisma.activity.update({
      where: { id },
      data
    });
  }

  /**
   * Gets an activity by ID
   */
  async getActivity(id: string): Promise<Activity | null> {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            participants: true,
            feedback: true
          }
        }
      }
    });
  }

  /**
   * Gets activities for an organization with filtering
   */
  async getActivities(organizationId: string, filters: {
    category?: string[];
    status?: ActivityStatus[];
    search?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<Activity[]> {
    const where: any = {
      organizationId,
      ...(filters.category && { category: { in: filters.category } }),
      ...(filters.status && { status: { in: filters.status } }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      })
    };

    return prisma.activity.findMany({
      where,
      include: {
        sessions: {
          where: {
            ...(filters.startDate && { startTime: { gte: filters.startDate } }),
            ...(filters.endDate && { endTime: { lte: filters.endDate } })
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Creates activity sessions based on recurrence pattern
   */
  async scheduleActivity(
    activityId: string,
    startDate: Date,
    recurrence: ActivityRecurrence
  ): Promise<ActivitySession[]> {
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) throw new Error('Activity not found');

    const sessions: Partial<ActivitySession>[] = [];
    let currentDate = new Date(startDate);
    const endDate = recurrence.endDate || addMonths(startDate, 3); // Default to 3 months if no end date

    while (currentDate <= endDate) {
      // Check if date should be skipped
      const shouldSkip = recurrence.exceptions?.some(exception => 
        isSameDay(parseISO(exception.toString()), currentDate)
      );

      if (!shouldSkip) {
        // Check if day matches recurrence pattern
        const dayOfWeek = currentDate.getDay();
        const dayOfMonth = currentDate.getDate();
        const isValidDay = recurrence.frequency === 'DAILY' ||
          (recurrence.frequency === 'WEEKLY' && recurrence.days?.includes(dayOfWeek)) ||
          (recurrence.frequency === 'MONTHLY' && recurrence.days?.includes(dayOfMonth));

        if (isValidDay) {
          sessions.push({
            activityId,
            startTime: new Date(currentDate),
            endTime: new Date(currentDate.getTime() + activity.duration * 60000),
            status: ActivityStatus.SCHEDULED,
            organizationId: activity.organizationId,
            location: activity.location,
            materials: activity.materials,
            staffMembers: []
          });
        }
      }

      // Advance to next date based on frequency
      switch (recurrence.frequency) {
        case 'DAILY':
          currentDate = addDays(currentDate, 1);
          break;
        case 'WEEKLY':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'MONTHLY':
          currentDate = addMonths(currentDate, 1);
          break;
      }
    }

    // Create all sessions in a transaction
    return prisma.$transaction(
      sessions.map(session => 
        prisma.activitySession.create({ data: session as any })
      )
    );
  }

  /**
   * Records participant attendance and engagement
   */
  async recordParticipation(data: Omit<ActivityParticipant, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActivityParticipant> {
    return prisma.activityParticipant.create({
      data: {
        ...data,
        adaptationsUsed: data.adaptationsUsed || [],
        achievedObjectives: data.achievedObjectives || []
      }
    });
  }

  /**
   * Updates a session's status and details
   */
  async updateSession(id: string, data: Partial<ActivitySession>): Promise<ActivitySession> {
    return prisma.activitySession.update({
      where: { id },
      data
    });
  }

  /**
   * Gets upcoming sessions for a resident based on preferences
   */
  async getRecommendedSessions(residentId: string): Promise<ActivitySession[]> {
    const preferences = await prisma.activityPreference.findUnique({
      where: { residentId }
    });

    if (!preferences) return [];

    return prisma.activitySession.findMany({
      where: {
        status: ActivityStatus.SCHEDULED,
        startTime: { gte: new Date() },
        activity: {
          category: { in: preferences.categories },
          difficulty: preferences.preferredDifficulty
        }
      },
      include: {
        activity: true,
        participants: {
          where: { residentId }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  /**
   * Records an achievement for a resident
   */
  async recordAchievement(data: Omit<ActivityAchievement, 'id' | 'createdAt'>): Promise<ActivityAchievement> {
    return prisma.activityAchievement.create({
      data: {
        ...data,
        date: data.date || new Date()
      }
    });
  }

  /**
   * Gets activity statistics for a resident
   */
  async getResidentStats(residentId: string, startDate?: Date, endDate?: Date): Promise<{
    totalSessions: number;
    participationRate: number;
    favoriteCategories: { category: string; count: number }[];
    achievements: number;
    averageMood: string | null;
  }> {
    const participants = await prisma.activityParticipant.findMany({
      where: {
        residentId,
        session: {
          startTime: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate })
          }
        }
      },
      include: {
        session: {
          include: {
            activity: true
          }
        }
      }
    });

    const totalSessions = participants.length;
    const fullParticipation = participants.filter(p => p.participationLevel === 'FULL').length;
    const participationRate = totalSessions ? (fullParticipation / totalSessions) * 100 : 0;

    // Calculate favorite categories
    const categoryCount: Record<string, number> = {};
    participants.forEach(p => {
      const category = p.session.activity.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Get achievements count
    const achievements = await prisma.activityAchievement.count({
      where: {
        residentId,
        date: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate })
        }
      }
    });

    // Calculate average mood
    const moods = participants
      .filter(p => p.mood)
      .map(p => p.mood as string);
    const averageMood = moods.length ? 
      moods.sort((a, b) => 
        moods.filter(v => v === a).length - moods.filter(v => v === b).length
      ).pop() : null;

    return {
      totalSessions,
      participationRate,
      favoriteCategories,
      achievements,
      averageMood
    };
  }

  /**
   * Gets activity statistics for an organization
   */
  async getOrganizationStats(organizationId: string, startDate?: Date, endDate?: Date): Promise<{
    totalActivities: number;
    totalSessions: number;
    participationRate: number;
    popularActivities: { id: string; name: string; participants: number }[];
    categoryDistribution: { category: string; count: number }[];
    upcomingSessions: number;
  }> {
    const [activities, sessions, upcomingSessions] = await Promise.all([
      prisma.activity.count({ where: { organizationId } }),
      prisma.activitySession.findMany({
        where: {
          organizationId,
          startTime: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate })
          }
        },
        include: {
          activity: true,
          participants: true
        }
      }),
      prisma.activitySession.count({
        where: {
          organizationId,
          status: ActivityStatus.SCHEDULED,
          startTime: { gte: new Date() }
        }
      })
    ]);

    // Calculate participation rate
    const totalParticipants = sessions.reduce((sum, session) => sum + session.participants.length, 0);
    const maxPossibleParticipants = sessions.reduce((sum, session) => {
      const maxParticipants = session.activity.maxParticipants || 20; // Default to 20 if not specified
      return sum + maxParticipants;
    }, 0);
    const participationRate = maxPossibleParticipants ? (totalParticipants / maxPossibleParticipants) * 100 : 0;

    // Get popular activities
    const activityParticipants: Record<string, { name: string; participants: number }> = {};
    sessions.forEach(session => {
      const id = session.activity.id;
      if (!activityParticipants[id]) {
        activityParticipants[id] = {
          name: session.activity.name,
          participants: 0
        };
      }
      activityParticipants[id].participants += session.participants.length;
    });

    const popularActivities = Object.entries(activityParticipants)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 10);

    // Calculate category distribution
    const categoryCount: Record<string, number> = {};
    sessions.forEach(session => {
      const category = session.activity.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalActivities: activities,
      totalSessions: sessions.length,
      participationRate,
      popularActivities,
      categoryDistribution,
      upcomingSessions
    };
  }
}

// Export a singleton instance
export const activitiesService = new ActivitiesService(); 


