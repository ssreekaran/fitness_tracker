import type { Meta, StoryObj } from "@storybook/react";
import GoalsManager from "./GoalsManager";

// Mock Firebase auth for Storybook (currently unused but may be needed for future stories)
// const mockAuth = {
//   currentUser: { uid: "storybook-user" },
// };

// Mock the goals service
const mockGoalsService = {
  getGoals: () =>
    Promise.resolve([
      {
        id: "1",
        name: "Weekly Workouts",
        description: "Complete 5 workouts this week",
        target: 5,
        currentValue: 3,
        type: "weekly" as const,
        category: "workout" as const,
        isActive: true,
        difficulty: "intermediate" as const,
        priority: "high" as const,
      },
      {
        id: "2",
        name: "Monthly Calories",
        description: "Burn 10,000 calories this month",
        target: 10000,
        currentValue: 6500,
        type: "monthly" as const,
        category: "calories" as const,
        isActive: true,
        difficulty: "advanced" as const,
        priority: "medium" as const,
      },
    ]),
  getAchievements: () =>
    Promise.resolve([
      {
        id: "1",
        name: "Getting Started",
        description: "Complete your first workout",
        isUnlocked: true,
        points: 10,
        rarity: "common" as const,
      },
      {
        id: "2",
        name: "Consistent Performer",
        description: "Maintain a 7-day workout streak",
        isUnlocked: false,
        points: 50,
        rarity: "rare" as const,
      },
    ]),
  getUserLevel: () => Promise.resolve({ level: 3, points: 150 }),
};

const meta: Meta<typeof GoalsManager> = {
  title: "Components/GoalsManager",
  component: GoalsManager,
  parameters: {
    layout: "fullscreen",
    mockData: [
      {
        url: "/api/goals",
        method: "GET",
        status: 200,
        response: mockGoalsService.getGoals(),
      },
    ],
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithManyGoals: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/goals",
        method: "GET",
        status: 200,
        response: Promise.resolve([
          ...(await mockGoalsService.getGoals()),
          {
            id: "3",
            name: "Strength Training",
            description: "Complete 3 strength sessions",
            target: 3,
            currentValue: 1,
            type: "weekly" as const,
            category: "strength" as const,
            isActive: true,
            difficulty: "beginner" as const,
            priority: "low" as const,
          },
        ]),
      },
    ],
  },
};

export const EmptyState: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/goals",
        method: "GET",
        status: 200,
        response: Promise.resolve([]),
      },
    ],
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
  },
};
