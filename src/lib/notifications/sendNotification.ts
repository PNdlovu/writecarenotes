interface Notification {
  userId: string;
  message: string;
}

export async function sendNotification({ userId, message }: Notification) {
  // Simulate sending a notification
  console.log(`Notification sent to user ${userId}: ${message}`);
}


