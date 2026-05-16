import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "../lib/firebase";
import { toast } from "sonner";

export const messagingService = {
  async requestPermission() {
    try {
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: "YOUR_VAPID_KEY_HERE" // This would be provided by the user in a real scenario
        });
        console.log("FCM Token:", token);
        return token;
      } else {
        console.warn("Notification permission denied");
        return null;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return null;
    }
  },

  onMessageListener() {
    const messaging = getMessaging(app);
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log("Message received:", payload);
        toast.info(payload.notification?.title || "New Notification", {
          description: payload.notification?.body
        });
        resolve(payload);
      });
    });
  }
};
