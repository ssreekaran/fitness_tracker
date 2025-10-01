/**
 * Calorie Burn Heatmap Component
 *
 * Displays calorie burn patterns with:
 * - Daily calorie burn visualization
 * - Exercise type breakdown
 * - Intensity patterns
 */

import React, { useMemo } from "react";
import {
  WorkoutTrendPoint,
  CalorieBurnInsights,
} from "../../services/analyticsService";
import "./CalorieBurnHeatmap.css";

interface CalorieBurnHeatmapProps {
  trends: WorkoutTrendPoint[];
  insights: CalorieBurnInsights;
}

const CalorieBurnHeatmap: React.FC<CalorieBurnHeatmapProps> = ({
  trends,
  insights,
}) => {
  const heatmapData = useMemo(() => {
    if (!trends || trends.length === 0) return null;

    const maxCalories = Math.max(...trends.map((d) => d.calories));
    const minCalories = Math.min(...trends.map((d) => d.calories));

    // Group by week and day
    const weeks: { [key: string]: WorkoutTrendPoint[] } = {};

    trends.forEach((point) => {
      const date = new Date(point.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(point);
    });

    return {
      weeks: Object.entries(weeks).slice(-8), // Last 8 weeks
      maxCalories,
      minCalories,
    };
  }, [trends]);

  const getIntensityColor = (calories: number, maxCalories: number) => {
    if (calories === 0) return "#f8f9fa";

    const intensity = calories / maxCalories;
    if (intensity >= 0.8) return "#d73527"; // High intensity
    if (intensity >= 0.6) return "#fd7e14"; // Medium-high
    if (intensity >= 0.4) return "#ffc107"; // Medium
    if (intensity >= 0.2) return "#20c997"; // Low-medium
    return "#6f42c1"; // Low
  };

  const getDayName = (dayIndex: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!heatmapData || heatmapData.weeks.length === 0) {
    return (
      <div className="calorie-heatmap-empty">
        <div className="empty-icon">🔥</div>
        <p>No calorie data available for heatmap.</p>
        <small className="text-muted">
          Complete more workouts to see patterns!
        </small>
      </div>
    );
  }

  return (
    <div className="calorie-burn-heatmap">
      {/* Heatmap Grid */}
      <div className="heatmap-container">
        <div className="heatmap-header">
          <div className="day-labels">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
              <div key={dayIndex} className="day-label">
                {getDayName(dayIndex)}
              </div>
            ))}
          </div>
        </div>

        <div className="heatmap-grid">
          {heatmapData.weeks.map(([weekStart, weekData]) => (
            <div key={weekStart} className="week-row">
              <div className="week-label">{formatDate(weekStart)}</div>
              <div className="week-days">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const dayData = weekData.find((d) => {
                    const date = new Date(d.date);
                    return date.getDay() === dayIndex;
                  });

                  const calories = dayData?.calories || 0;

                  return (
                    <div
                      key={dayIndex}
                      className="day-cell"
                      style={{
                        backgroundColor: getIntensityColor(
                          calories,
                          heatmapData.maxCalories
                        ),
                      }}
                      title={`${getDayName(dayIndex)}: ${calories} calories`}
                    >
                      {calories > 0 && (
                        <span className="calorie-value">
                          {calories > 999
                            ? `${(calories / 1000).toFixed(1)}k`
                            : calories}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <div className="legend-colors">
            <div
              className="legend-color"
              style={{ backgroundColor: "#f8f9fa" }}
            ></div>
            <div
              className="legend-color"
              style={{ backgroundColor: "#6f42c1" }}
            ></div>
            <div
              className="legend-color"
              style={{ backgroundColor: "#20c997" }}
            ></div>
            <div
              className="legend-color"
              style={{ backgroundColor: "#ffc107" }}
            ></div>
            <div
              className="legend-color"
              style={{ backgroundColor: "#fd7e14" }}
            ></div>
            <div
              className="legend-color"
              style={{ backgroundColor: "#d73527" }}
            ></div>
          </div>
          <span className="legend-label">More</span>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="insights-panel">
        <h6>🔥 Calorie Burn Insights</h6>

        <div className="insight-stats">
          <div className="insight-stat">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{insights.averagePerWorkout}</div>
              <div className="stat-label">Avg per workout</div>
            </div>
          </div>

          <div className="insight-stat">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-value">{insights.bestDay.calories}</div>
              <div className="stat-label">Best day</div>
            </div>
          </div>

          <div className="insight-stat">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-value">{insights.averagePerDay}</div>
              <div className="stat-label">Daily average</div>
            </div>
          </div>
        </div>

        {/* Top Exercises Mini List */}
        <div className="top-exercises-mini">
          <h6>Top Calorie Burners</h6>
          {insights.topExercises.slice(0, 3).map((exercise, index) => (
            <div key={exercise.exercise} className="exercise-mini">
              <span className="exercise-rank">#{index + 1}</span>
              <span className="exercise-name">{exercise.exercise}</span>
              <span className="exercise-calories">{exercise.calories}</span>
            </div>
          ))}
        </div>

        {/* Weekly Trend */}
        <div className="weekly-trend-mini">
          <h6>Weekly Trend</h6>
          <div className="trend-bars">
            {insights.weeklyTrend.slice(-8).map((calories, index) => (
              <div
                key={index}
                className="trend-bar"
                style={{
                  height: `${
                    (calories / Math.max(...insights.weeklyTrend)) * 100
                  }%`,
                  backgroundColor: getIntensityColor(
                    calories,
                    Math.max(...insights.weeklyTrend)
                  ),
                }}
                title={`Week ${index + 1}: ${calories} calories`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieBurnHeatmap;
