import { renderWithoutRouter, screen, waitFor } from "../../utils/test-utils";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { server } from "../../mocks/server";

import WorkoutTracker from "../../components/fitness/WorkoutTracker";

// Mock the workout service for integration tests
vi.mock("../../services/workoutService", () => ({
  saveWorkout: vi.fn(() => Promise.resolve({ id: "new-workout-1" })),
  getUserWorkouts: vi.fn(() => Promise.resolve([])),
  deleteWorkout: vi.fn(() => Promise.resolve()),
}));

describe("Workout Flow Integration", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset any runtime request handlers we may add during the tests
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it("should complete full workout logging flow", async () => {
    const { saveWorkout, getUserWorkouts } = await import(
      "../../services/workoutService"
    );

    // Mock successful workout creation and retrieval
    vi.mocked(saveWorkout).mockResolvedValue({
      id: "new-workout-1",
      userId: "test-user",
      exercise: "Running (5 mph/8 kmh, 12:00 min/mi)",
      duration: 30,
      caloriesBurned: 300,
      date: new Date(),
    });
    vi.mocked(getUserWorkouts).mockResolvedValue([
      {
        id: "new-workout-1",
        userId: "test-user",
        exercise: "Running (5 mph/8 kmh, 12:00 min/mi)",
        duration: 30,
        caloriesBurned: 300,
        date: new Date().toISOString(),
      },
    ]);

    renderWithoutRouter(<WorkoutTracker userWeight={70} />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/workout tracker/i)).toBeInTheDocument();
    });

    // Open the workout form
    const logWorkoutButton = screen.getByRole("button", {
      name: /log workout/i,
    });
    await user.click(logWorkoutButton);

    // Fill out the workout form
    const exerciseSelect = screen.getByLabelText(/exercise/i);
    const durationInput = screen.getByLabelText(/duration/i);

    await user.selectOptions(
      exerciseSelect,
      "Running (5 mph/8 kmh, 12:00 min/mi)"
    );
    await user.clear(durationInput);
    await user.type(durationInput, "30");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save workout/i });
    await user.click(saveButton);

    // Verify the service was called
    expect(saveWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        exercise: "Running (5 mph/8 kmh, 12:00 min/mi)",
        duration: 30,
        caloriesBurned: expect.any(Number),
      })
    );
  });

  it("should handle workout creation errors gracefully", async () => {
    const { saveWorkout } = await import("../../services/workoutService");

    // Mock API error
    vi.mocked(saveWorkout).mockRejectedValue(
      new Error("Failed to save workout")
    );

    renderWithoutRouter(<WorkoutTracker userWeight={70} />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/workout tracker/i)).toBeInTheDocument();
    });

    // Open the workout form
    const logWorkoutButton = screen.getByRole("button", {
      name: /log workout/i,
    });
    await user.click(logWorkoutButton);

    // Fill and submit form
    const exerciseSelect = screen.getByLabelText(/exercise/i);
    const durationInput = screen.getByLabelText(/duration/i);

    await user.selectOptions(
      exerciseSelect,
      "Running (5 mph/8 kmh, 12:00 min/mi)"
    );
    await user.clear(durationInput);
    await user.type(durationInput, "30");

    const saveButton = screen.getByRole("button", { name: /save workout/i });
    await user.click(saveButton);

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to save workout/i)).toBeInTheDocument();
    });
  });

  it("should display workout history after creation", async () => {
    const { saveWorkout, getUserWorkouts } = await import(
      "../../services/workoutService"
    );

    // Mock successful workout creation and retrieval
    const mockWorkout = {
      id: "new-workout-1",
      userId: "test-user",
      exercise: "Running (5 mph/8 kmh, 12:00 min/mi)",
      duration: 30,
      caloriesBurned: 300,
      date: new Date().toISOString(),
    };

    vi.mocked(saveWorkout).mockResolvedValue({
      id: "new-workout-1",
      userId: "test-user",
      exercise: "Running (5 mph/8 kmh, 12:00 min/mi)",
      duration: 30,
      caloriesBurned: 300,
      date: new Date(),
    });
    vi.mocked(getUserWorkouts)
      .mockResolvedValueOnce([]) // Initial empty state
      .mockResolvedValueOnce([mockWorkout]); // After workout creation

    renderWithoutRouter(<WorkoutTracker userWeight={70} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/no workouts found/i)).toBeInTheDocument();
    });

    // Create a workout
    const logWorkoutButton = screen.getByRole("button", {
      name: /log workout/i,
    });
    await user.click(logWorkoutButton);

    const exerciseSelect = screen.getByLabelText(/exercise/i);
    const durationInput = screen.getByLabelText(/duration/i);

    await user.selectOptions(
      exerciseSelect,
      "Running (5 mph/8 kmh, 12:00 min/mi)"
    );
    await user.clear(durationInput);
    await user.type(durationInput, "30");

    const saveButton = screen.getByRole("button", { name: /save workout/i });
    await user.click(saveButton);

    // Verify workout appears in the list
    await waitFor(() => {
      // Look for the workout in the table specifically
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      // Look for the table body and check for workout data
      const tbody = table.querySelector("tbody");
      expect(tbody).toBeInTheDocument();
      expect(tbody).toHaveTextContent("Running (5 mph/8 kmh, 12:00 min/mi)");
      expect(tbody).toHaveTextContent("300"); // calories in table
    });
  });
});
