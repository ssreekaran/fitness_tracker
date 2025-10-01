/**
 * Test Button Component for Goals System
 *
 * This is a temporary component to test the enhanced goals system functionality.
 * You can add this to any page to test achievements and notifications.
 */

import React from "react";
import { Button, Space } from "antd";
import { notificationService } from "../services/notificationService";
import { unlockAchievement } from "../services/goalsService";

const GoalsTestButton: React.FC = () => {
  const testAchievementUnlock = () => {
    notificationService.showAchievementUnlock("Test Achievement", 50, "🏆");
  };

  const testGoalCompletion = () => {
    notificationService.showGoalCompletion("Weekly Workouts", "weekly");
  };

  const testMilestone = () => {
    notificationService.showMilestoneAchievement(
      "First Week Complete",
      "Unlock advanced features"
    );
  };

  const testLevelUp = () => {
    notificationService.showLevelUp(3, 250);
  };

  const testStreak = () => {
    notificationService.showStreakAchievement(7);
  };

  const testUnlockFirstWorkout = async () => {
    try {
      await unlockAchievement("first_workout");
    } catch (error) {
      console.log("Achievement already unlocked or error:", error);
      // Fallback to show notification directly
      notificationService.showAchievementUnlock("Getting Started", 10, "🏃‍♂️");
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        background: "#f5f5f5",
        borderRadius: "8px",
        margin: "16px 0",
      }}
    >
      <h4>🧪 Goals System Test Panel</h4>
      <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "16px" }}>
        Test the enhanced goals system notifications and achievements:
      </p>
      <Space wrap>
        <Button onClick={testAchievementUnlock} type="primary">
          Test Achievement 🏆
        </Button>
        <Button onClick={testGoalCompletion}>Test Goal Complete 🎯</Button>
        <Button onClick={testMilestone}>Test Milestone 🏁</Button>
        <Button onClick={testLevelUp}>Test Level Up ⭐</Button>
        <Button onClick={testStreak}>Test Streak 🔥</Button>
        <Button onClick={testUnlockFirstWorkout} type="dashed">
          Unlock First Workout
        </Button>
      </Space>
    </div>
  );
};

export default GoalsTestButton;
