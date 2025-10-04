import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Firebase Auth
  http.post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",
    () => {
      return HttpResponse.json({
        idToken: "mock-id-token",
        email: "test@example.com",
        refreshToken: "mock-refresh-token",
        expiresIn: "3600",
        localId: "mock-user-id",
      });
    }
  ),

  // Mock Firestore operations
  http.post(
    "https://firestore.googleapis.com/v1/projects/*/databases/(default)/documents/*",
    () => {
      return HttpResponse.json({
        name: "projects/test/databases/(default)/documents/collection/doc-id",
        fields: {},
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      });
    }
  ),

  http.get(
    "https://firestore.googleapis.com/v1/projects/*/databases/(default)/documents/*",
    () => {
      return HttpResponse.json({
        documents: [],
      });
    }
  ),

  // Mock workout data
  http.get("/api/workouts", () => {
    return HttpResponse.json([
      {
        id: "1",
        exercise: "Running",
        duration: 30,
        calories: 300,
        date: new Date().toISOString(),
        userId: "test-user",
      },
      {
        id: "2",
        exercise: "Push-ups",
        duration: 15,
        calories: 100,
        date: new Date().toISOString(),
        userId: "test-user",
      },
    ]);
  }),

  // Mock goals data
  http.get("/api/goals", () => {
    return HttpResponse.json([
      {
        id: "1",
        name: "Weekly Workouts",
        description: "Complete 5 workouts this week",
        target: 5,
        currentValue: 3,
        type: "weekly",
        category: "workout",
        isActive: true,
        difficulty: "intermediate",
        priority: "high",
        userId: "test-user",
      },
    ]);
  }),

  // Mock analytics data
  http.get("/api/analytics/trends", () => {
    return HttpResponse.json({
      trends: [
        { date: "2024-01-01", workouts: 3, calories: 900 },
        { date: "2024-01-02", workouts: 2, calories: 600 },
        { date: "2024-01-03", workouts: 4, calories: 1200 },
      ],
      totalWorkouts: 9,
      averageCalories: 900,
    });
  }),

  // Mock AI chatbot responses
  http.post("/api/chat", async ({ request }) => {
    const { message } = (await request.json()) as { message: string };

    return HttpResponse.json({
      response: `This is a mock response to: "${message}". In a real implementation, this would be processed by an AI service.`,
      timestamp: new Date().toISOString(),
    });
  }),
];
