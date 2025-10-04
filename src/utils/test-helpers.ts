// Common test data factories
export const createMockWorkout = (overrides = {}) => ({
  id: "test-workout-1",
  exercise: "Running",
  duration: 30,
  calories: 300,
  date: new Date().toISOString(),
  userId: "test-user",
  ...overrides,
});

export const createMockGoal = (overrides = {}) => ({
  id: "test-goal-1",
  name: "Weekly Workouts",
  description: "Complete 5 workouts this week",
  target: 5,
  currentValue: 3,
  type: "weekly" as const,
  category: "workout" as const,
  isActive: true,
  difficulty: "intermediate" as const,
  priority: "high" as const,
  userId: "test-user",
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  uid: "test-user",
  email: "test@example.com",
  displayName: "Test User",
  ...overrides,
});

// Test helpers for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock Firebase auth user
export const mockAuthUser = {
  uid: "test-user",
  email: "test@example.com",
  displayName: "Test User",
  emailVerified: true,
};

// Helper to mock successful API responses
export const mockApiSuccess = (data: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) });

// Helper to mock API errors
export const mockApiError = (message: string) =>
  Promise.reject(new Error(message));
