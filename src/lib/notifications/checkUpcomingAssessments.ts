import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sendNotification";

export async function checkUpcomingAssessments() {
  try {
    const upcomingAssessments = await prisma.assessment.findMany({
      where: {
        nextReviewDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
        status: "COMPLETED",
      },
      include: {
        resident: true,
        completedBy: true,
      },
    });

    for (const assessment of upcomingAssessments) {
      await sendNotification({
        userId: assessment.completedById,
        message: `Upcoming assessment for resident ${assessment.resident.firstName} ${assessment.resident.lastName} in room ${assessment.resident.roomNumber} is due on ${new Date(assessment.nextReviewDate).toLocaleDateString()}.`,
      });
    }
  } catch (error) {
    console.error("Error checking upcoming assessments:", error);
  }
}


