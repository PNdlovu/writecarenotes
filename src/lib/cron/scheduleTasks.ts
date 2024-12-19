import cron from 'node-cron';
import { checkUpcomingAssessments } from "@/lib/notifications/checkUpcomingAssessments";

// Schedule task to check for upcoming assessments every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running scheduled task: checkUpcomingAssessments');
  await checkUpcomingAssessments();
});


