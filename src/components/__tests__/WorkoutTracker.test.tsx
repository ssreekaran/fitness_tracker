import { renderWithoutRouter, screen, waitFor } from "../../utils/test-utils";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import WorkoutTracker from "../fitness/WorkoutTracker";

// Mock the workout service
vi.mock("../../services/workoutService", () => ({
  saveWorkout: vi.fn(() => Promise.resolve({ id: "1" })),
  getUserWorkouts: vi.fn(() => Promise.resolve([])),
  deleteWorkout: vi.fn(() => Promise.resolve()),
}));

// Mock Firebase auth
vi.mock("../../firebase", () => ({
  auth: {
    currentUser: { uid: "test-user" },
  },
}));

describe("WorkoutTracker Component", () => {
  const user = userEvent.setup();
  const defaultProps = { userWeight: 70 }; // Component requires userWeight prop

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders workout tracker interface", async () => {
    renderWithoutRouter(<WorkoutTracker {...defaultProps} />);

    expect(screen.getByText(/workout tracker/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log workout/i })
    ).toBeInTheDocument();
  });

  it("opens workout form when log workout button is clicked", async () => {
    renderWithoutRouter(<WorkoutTracker {...defaultProps} />);

    const logButton = screen.getByRole("button", { name: /log workout/i });
    await user.click(logButton);

    expect(screen.getByLabelText(/exercise/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
  });

  it("adds a new workout when form is submitted", async () => {
    const { saveWorkout } = await import("../../services/workoutService");

    renderWithoutRouter(<WorkoutTracker {...defaultProps} />);

    // Open form
    const logButton = screen.getByRole("button", { name: /log workout/i });
    await user.click(logButton);

    // Fill form
    const exerciseSelect = screen.getByLabelText(/exercise/i);
    const durationInput = screen.getByLabelText(/duration/i);

    await user.selectOptions(
      exerciseSelect,
      "Running (5 mph/8 kmh, 12:00 min/mi)"
    );
    await user.clear(durationInput);
    await user.type(durationInput, "30");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /save workout/i });
    await user.click(submitButton);

    expect(saveWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        exercise: "Running (5 mph/8 kmh, 12:00 min/mi)",
        duration: 30,
        caloriesBurned: expect.any(Number),
      })
    );
  });

  it("validates required fields", async () => {
    renderWithoutRouter(<WorkoutTracker {...defaultProps} />);

    // Open form
    const logButton = screen.getByRole("button", { name: /log workout/i });
    await user.click(logButton);

    // Try to submit empty form (exercise is required)
    const submitButton = screen.getByRole("button", { name: /save workout/i });
    await user.click(submitButton);

    // HTML5 validation will prevent form submission, so we check if form is still visible
    expect(screen.getByLabelText(/exercise/i)).toBeInTheDocument();
  });

  it("displays workout history", async () => {
    const mockWorkouts = [
      {
        id: "1",
        userId: "test-user",
        exercise: "Running (5 mph/8 kmh, 12:00 min/mi)",
        duration: 30,
        caloriesBurned: 300,
        date: new Date().toISOString(),
      },
    ];

    const { getUserWorkouts } = await import("../../services/workoutService");
    vi.mocked(getUserWorkouts).mockResolvedValue(mockWorkouts);

    renderWithoutRouter(<WorkoutTracker {...defaultProps} />);

    await waitFor(() => {
      // Look for the workout in the table specifically, not in the dropdown
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      // Look for the table body and check for workout data
      const tbody = table.querySelector("tbody");
      expect(tbody).toBeInTheDocument();
      expect(tbody).toHaveTextContent("Running (5 mph/8 kmh, 12:00 min/mi)");
      expect(tbody).toHaveTextContent("300"); // calories
    });
  });

  it("shows no workouts message when list is empty", async () => {
    const { getUserWorkouts } = await import("../../services/workoutService");
    vi.mocked(getUserWorkouts).mockResolvedValue([]);

    renderWithoutRouter(<WorkoutTracker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/no workouts found/i)).toBeInTheDocument();
    });
  });
});
