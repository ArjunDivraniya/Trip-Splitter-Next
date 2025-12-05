import Notification from "@/models/Notification";

export async function sendNotification(
  recipients: string[], 
  senderId: string, 
  tripId: string, 
  message: string, 
  type: "invite" | "expense" | "activity" | "system"
) {
  try {
    // Filter out the sender so they don't notify themselves
    const targets = recipients.filter(id => id.toString() !== senderId.toString());

    if (targets.length === 0) return;

    const notifications = targets.map(recipientId => ({
      recipient: recipientId,
      sender: senderId,
      trip: tripId,
      message,
      type,
      isRead: false,
      createdAt: new Date()
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Failed to send notifications:", error);
  }
}