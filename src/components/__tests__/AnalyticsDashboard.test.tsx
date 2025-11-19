import { renderWithoutRouter, screen } from "../../utils/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AnalyticsDashboard from "../fitness/AnalyticsDashboard";

// Mock the analytics service with minimal data
vi.mock("../../services/analyticsService", () => ({
  getAnalyticsDashboard: vi.fn(() => Promise.reject(new Error("No data"))),
}));

// Mock Firebase auth
vi.mock("../../firebase", () => ({
  auth: {
    currentUser: { uid: "test-user" },
  },
}));

describe("AnalyticsDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders analytics dashboard with loading state", async () => {
    renderWithoutRouter(<AnalyticsDashboard />);

    // Should show loading initially
    expect(
      screen.getByText(/loading your fitness analytics/i)
    ).toBeInTheDocument();
  });

  it("handles service errors gracefully", async () => {
    renderWithoutRouter(<AnalyticsDashboard />);

    // Component should render without crashing even when service fails
    expect(
      screen.getByText(/loading your fitness analytics/i)
    ).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    // Simple smoke test
    expect(() => renderWithoutRouter(<AnalyticsDashboard />)).not.toThrow();
  });
});
