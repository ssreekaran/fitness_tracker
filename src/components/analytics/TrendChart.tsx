/**
 * Trend Chart Component
 *
 * Displays workout trends over time with multiple metrics:
 * - Number of workouts
 * - Calories burned
 * - Duration
 */

import React, { useMemo } from "react";
import {
  WorkoutTrendPoint,
  AnalyticsPeriod,
} from "../../services/analyticsService";
import "./TrendChart.css";

interface TrendChartProps {
  data: WorkoutTrendPoint[];
  period: AnalyticsPeriod;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, period }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxWorkouts = Math.max(...data.map((d) => d.workouts));
    const maxCalories = Math.max(...data.map((d) => d.calories));
    const maxDuration = Math.max(...data.map((d) => d.duration));

    return {
      points: data,
      maxWorkouts,
      maxCalories,
      maxDuration,
    };
  }, [data]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === "7d") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (period === "30d") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getDisplayPoints = () => {
    if (!chartData) return [];

    // Limit points for better visualization
    const maxPoints = period === "7d" ? 7 : period === "30d" ? 15 : 20;
    const step = Math.ceil(chartData.points.length / maxPoints);

    return chartData.points.filter((_, index) => index % step === 0);
  };

  if (!chartData || chartData.points.length === 0) {
    return (
      <div className="trend-chart-empty">
        <div className="empty-icon">📈</div>
        <p>No workout data available for the selected period.</p>
        <small className="text-muted">
          Start logging workouts to see trends!
        </small>
      </div>
    );
  }

  const displayPoints = getDisplayPoints();
  const svgWidth = 100;
  const svgHeight = 60;

  return (
    <div className="trend-chart">
      {/* Chart Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color legend-color--workouts"></div>
          <span>Workouts</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-color--calories"></div>
          <span>Calories</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-color--duration"></div>
          <span>Duration (min)</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="chart-container">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="trend-svg">
          {/* Grid Lines */}
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Workout Count Line */}
          <polyline
            fill="none"
            stroke="#3498db"
            strokeWidth="2"
            points={displayPoints
              .map((point, index) => {
                const x =
                  (index / (displayPoints.length - 1)) * (svgWidth - 10) + 5;
                const y =
                  svgHeight -
                  5 -
                  (point.workouts / chartData.maxWorkouts) * (svgHeight - 10);
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Calories Line */}
          <polyline
            fill="none"
            stroke="#e74c3c"
            strokeWidth="2"
            strokeDasharray="5,5"
            points={displayPoints
              .map((point, index) => {
                const x =
                  (index / (displayPoints.length - 1)) * (svgWidth - 10) + 5;
                const y =
                  svgHeight -
                  5 -
                  (point.calories / chartData.maxCalories) * (svgHeight - 10);
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Duration Line */}
          <polyline
            fill="none"
            stroke="#2ecc71"
            strokeWidth="2"
            strokeDasharray="2,3"
            points={displayPoints
              .map((point, index) => {
                const x =
                  (index / (displayPoints.length - 1)) * (svgWidth - 10) + 5;
                const y =
                  svgHeight -
                  5 -
                  (point.duration / chartData.maxDuration) * (svgHeight - 10);
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Data Points */}
          {displayPoints.map((point, index) => {
            const x =
              (index / (displayPoints.length - 1)) * (svgWidth - 10) + 5;
            const workoutY =
              svgHeight -
              5 -
              (point.workouts / chartData.maxWorkouts) * (svgHeight - 10);

            return (
              <g key={point.date}>
                <circle
                  cx={x}
                  cy={workoutY}
                  r="2"
                  fill="#3498db"
                  className="data-point"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltips */}
        <div className="chart-tooltips">
          {displayPoints.map((point, index) => (
            <div
              key={point.date}
              className="tooltip-trigger"
              style={{
                left: `${(index / (displayPoints.length - 1)) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="tooltip-content">
                <div className="tooltip-date">{formatDate(point.date)}</div>
                <div className="tooltip-stats">
                  <div>🏋️‍♂️ {point.workouts} workouts</div>
                  <div>🔥 {point.calories} calories</div>
                  <div>⏱️ {point.duration} minutes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="chart-summary">
        <div className="summary-stat">
          <div className="stat-value">
            {chartData.points.reduce((sum, p) => sum + p.workouts, 0)}
          </div>
          <div className="stat-label">Total Workouts</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value">
            {chartData.points
              .reduce((sum, p) => sum + p.calories, 0)
              .toLocaleString()}
          </div>
          <div className="stat-label">Total Calories</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value">
            {Math.round(
              chartData.points.reduce((sum, p) => sum + p.duration, 0) / 60
            )}
            h
          </div>
          <div className="stat-label">Total Hours</div>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
