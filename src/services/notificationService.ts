/**
 * Notification Service - Achievement and Goal Notifications
 *
 * This service handles notifications for:
 * - Achievement unlocks
 * - Goal completions
 * - Milestone achievements
 * - Reminder notifications
 * - Progress celebrations
 */

import { logger } from "../utils/logger";

export interface NotificationConfig {
  title: string;
  message: string;
  type: "achievement" | "goal" | "milestone" | "reminder" | "celebration";
  icon?: string;
  duration?: number; // in milliseconds
  action?: {
    label: string;
    callback: () => void;
  };
}

class NotificationService {
  private notifications: NotificationConfig[] = [];
  private listeners: ((notification: NotificationConfig) => void)[] = [];

  /**
   * Show a notification
   */
  show(config: NotificationConfig): void {
    // Respect global notification toggle stored in localStorage
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('notificationsEnabled') : null;
      const enabled = saved !== null ? JSON.parse(saved) : true;
      if (!enabled) {
        return;
      }
    } catch {
      // If parsing fails, proceed with default behavior
    }

    this.notifications.push(config);
    this.notifyListeners(config);

    // Auto-remove after duration
    if (config.duration) {
      setTimeout(() => {
        this.remove(config);
      }, config.duration);
    }

    logger.info("Notification shown", {
      type: config.type,
      title: config.title,
    });
  }

  /**
   * Show achievement unlock notification
   */
  showAchievementUnlock(
    achievementName: string,
    points: number,
    icon: string
  ): void {
    this.show({
      title: "Achievement Unlocked! 🎉",
      message: `You've earned "${achievementName}" (+${points} points)`,
      type: "achievement",
      icon,
      duration: 5000,
    });
  }

  /**
   * Show goal completion notification
   */
  showGoalCompletion(goalName: string, type: string): void {
    this.show({
      title: "Goal Completed! 🎯",
      message: `Congratulations! You've completed your ${type} goal: "${goalName}"`,
      type: "goal",
      icon: "🎯",
      duration: 4000,
    });
  }

  /**
   * Show milestone achievement notification
   */
  showMilestoneAchievement(milestoneName: string, reward?: string): void {
    this.show({
      title: "Milestone Reached! 🏆",
      message: `You've reached "${milestoneName}"${
        reward ? ` - ${reward}` : ""
      }`,
      type: "milestone",
      icon: "🏆",
      duration: 4000,
    });
  }

  /**
   * Show level up notification
   */
  showLevelUp(newLevel: number, totalPoints: number): void {
    this.show({
      title: "Level Up! ⭐",
      message: `You've reached Level ${newLevel}! (${totalPoints} total points)`,
      type: "celebration",
      icon: "⭐",
      duration: 5000,
    });
  }

  /**
   * Show streak notification
   */
  showStreakAchievement(streakDays: number): void {
    const streakEmoji =
      streakDays >= 30 ? "🔥🔥🔥" : streakDays >= 7 ? "🔥🔥" : "🔥";

    this.show({
      title: `${streakDays}-Day Streak! ${streakEmoji}`,
      message: `You're on fire! Keep the momentum going!`,
      type: "celebration",
      icon: "🔥",
      duration: 4000,
    });
  }

  /**
   * Show workout reminder
   */
  showWorkoutReminder(message: string): void {
    this.show({
      title: "Workout Reminder 💪",
      message: message || "Time for your workout!",
      type: "reminder",
      icon: "💪",
      duration: 0, // Don't auto-dismiss reminders
      action: {
        label: "Start Workout",
        callback: () => {
          // Navigate to workout tracker
          window.location.href = "/workout-planner";
        },
      },
    });
  }

  /**
   * Show progress celebration
   */
  showProgressCelebration(message: string): void {
    this.show({
      title: "Great Progress! 🎉",
      message,
      type: "celebration",
      icon: "🎉",
      duration: 3000,
    });
  }

  /**
   * Remove a notification
   */
  remove(notification: NotificationConfig): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
  }

  /**
   * Get all active notifications
   */
  getAll(): NotificationConfig[] {
    return [...this.notifications];
  }

  /**
   * Subscribe to notification events
   */
  subscribe(listener: (notification: NotificationConfig) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(notification: NotificationConfig): void {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        logger.error("Error in notification listener", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  /**
   * Request notification permission (for browser notifications)
   */
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      logger.warn("Browser doesn't support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  /**
   * Show browser notification (requires permission)
   */
  async showBrowserNotification(config: NotificationConfig): Promise<void> {
    // Respect global notification toggle
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('notificationsEnabled') : null;
      const enabled = saved !== null ? JSON.parse(saved) : true;
      if (!enabled) {
        return;
      }
    } catch {
      // ignore parse errors
    }

    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      logger.warn("No notification permission");
      return;
    }

    try {
      const notification = new Notification(config.title, {
        body: config.message,
        icon: "/icons/icon-192x192.png", // App icon
        badge: "/icons/badge-72x72.png",
        tag: config.type, // Prevent duplicate notifications
        requireInteraction: config.type === "reminder",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (config.action) {
          config.action.callback();
        }
      };

      // Auto-close after duration
      if (config.duration && config.duration > 0) {
        setTimeout(() => {
          notification.close();
        }, config.duration);
      }
    } catch (error) {
      logger.error("Failed to show browser notification", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// React hook for using notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<
    NotificationConfig[]
  >([]);

  React.useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    // Initialize with existing notifications
    setNotifications(notificationService.getAll());

    return unsubscribe;
  }, []);

  const removeNotification = (notification: NotificationConfig) => {
    notificationService.remove(notification);
    setNotifications((prev) => prev.filter((n) => n !== notification));
  };

  const clearAll = () => {
    notificationService.clearAll();
    setNotifications([]);
  };

  return {
    notifications,
    removeNotification,
    clearAll,
    showAchievementUnlock:
      notificationService.showAchievementUnlock.bind(notificationService),
    showGoalCompletion:
      notificationService.showGoalCompletion.bind(notificationService),
    showMilestoneAchievement:
      notificationService.showMilestoneAchievement.bind(notificationService),
    showLevelUp: notificationService.showLevelUp.bind(notificationService),
    showStreakAchievement:
      notificationService.showStreakAchievement.bind(notificationService),
    showWorkoutReminder:
      notificationService.showWorkoutReminder.bind(notificationService),
    showProgressCelebration:
      notificationService.showProgressCelebration.bind(notificationService),
  };
};

// Import React for the hook
import React from "react";
