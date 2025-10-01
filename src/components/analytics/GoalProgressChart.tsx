/**
 * Goal Progress Chart Component
 *
 * Displays goal achievement progress with:
 * - Completion rates
 * - Progress trends
 * - Goal categories
 */

import React from "react";
import { GoalAnalytics } from "../../services/analyticsService";
import "./GoalProgressChart.css";

interface GoalProgressChartProps {
  goals: GoalAnalytics[];
}

const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ goals }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "workout":
        return "🏋️‍♂️";
      case "calories":
        return "🔥";
      case "duration":
        return "⏱️";
      case "weight":
        return "⚖️";
      case "strength":
        return "💪";
      default:
        return "🎯";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "workout":
        return "#3498db";
      case "calories":
        return "#e74c3c";
      case "duration":
        return "#2ecc71";
      case "weight":
        return "#f39c12";
      case "strength":
        return "#9b59b6";
      default:
        return "#95a5a6";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return "📈";
      case "declining":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "#2ecc71";
      case "declining":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  if (!goals || goals.length === 0) {
    return (
      <div className="goal-progress-empty">
        <div className="empty-icon">🎯</div>
        <p>No active goals to display.</p>
        <small className="text-muted">
          Create goals to track your progress!
        </small>
      </div>
    );
  }

  return (
    <div className="goal-progress-chart">
      {/* Goals List */}
      <div className="goals-list">
        {goals.map((goal) => (
          <div key={goal.goalId} className="goal-item">
            <div className="goal-header">
              <div className="goal-info">
                <div className="goal-icon">
                  {getCategoryIcon(goal.category)}
                </div>
                <div className="goal-details">
                  <div className="goal-name">{goal.goalName}</div>
                  <div className="goal-category">{goal.category}</div>
                </div>
              </div>
              <div className="goal-trend">
                <span
                  className="trend-icon"
                  style={{ color: getTrendColor(goal.trend) }}
                >
                  {getTrendIcon(goal.trend)}
                </span>
                <span className="completion-rate">{goal.completionRate}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, goal.completionRate)}%`,
                    backgroundColor: getCategoryColor(goal.category),
                  }}
                />
              </div>
              <div className="progress-label">
                {goal.completionRate >= 100
                  ? "Completed!"
                  : goal.completionRate >= 80
                  ? "Almost there!"
                  : goal.completionRate >= 50
                  ? "Good progress"
                  : "Keep going!"}
              </div>
            </div>

            {/* Streak Info */}
            <div className="streak-info">
              <div className="streak-item">
                <span className="streak-icon">🔥</span>
                <span>Current: {goal.currentStreak}</span>
              </div>
              <div className="streak-item">
                <span className="streak-icon">🏆</span>
                <span>Best: {goal.bestStreak}</span>
              </div>
              <div className="streak-item">
                <span className="streak-icon">📊</span>
                <span>Avg: {goal.averageProgress.toFixed(1)}%</span>
              </div>
            </div>

            {/* Weekly Progress Mini Chart */}
            <div className="mini-chart">
              <div className="mini-chart-label">Last 12 weeks</div>
              <div className="mini-chart-bars">
                {goal.weeklyProgress.map((progress, index) => (
                  <div
                    key={index}
                    className="mini-bar"
                    style={{
                      height: `${Math.min(100, progress)}%`,
                      backgroundColor:
                        progress >= 100
                          ? getCategoryColor(goal.category)
                          : progress >= 80
                          ? "#f39c12"
                          : progress >= 50
                          ? "#3498db"
                          : "#bdc3c7",
                    }}
                    title={`Week ${index + 1}: ${progress.toFixed(1)}%`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="goals-summary">
        <div className="summary-item">
          <div className="summary-value">
            {goals.filter((g) => g.completionRate >= 100).length}
          </div>
          <div className="summary-label">Completed</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">
            {
              goals.filter(
                (g) => g.completionRate >= 80 && g.completionRate < 100
              ).length
            }
          </div>
          <div className="summary-label">On Track</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">
            {goals.filter((g) => g.trend === "improving").length}
          </div>
          <div className="summary-label">Improving</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">
            {Math.round(
              goals.reduce((sum, g) => sum + g.completionRate, 0) / goals.length
            )}
            %
          </div>
          <div className="summary-label">Avg Progress</div>
        </div>
      </div>
    </div>
  );
};

export default GoalProgressChart;
