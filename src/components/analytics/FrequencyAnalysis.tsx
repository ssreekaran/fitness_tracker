/**
 * Frequency Analysis Component
 *
 * Displays workout frequency patterns with:
 * - Weekly distribution
 * - Hourly patterns
 * - Consistency metrics
 */

import React from "react";
import { Card } from "react-bootstrap";
import { WorkoutFrequencyAnalysis } from "../../services/analyticsService";
import "./FrequencyAnalysis.css";

interface FrequencyAnalysisProps {
  analysis: WorkoutFrequencyAnalysis;
}

const FrequencyAnalysis: React.FC<FrequencyAnalysisProps> = ({ analysis }) => {
  const getDayAbbr = (day: string) => {
    return day.slice(0, 3);
  };

  const getHourLabel = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return "#2ecc71";
    if (score >= 60) return "#f39c12";
    if (score >= 40) return "#3498db";
    return "#e74c3c";
  };

  const getConsistencyMessage = (score: number) => {
    if (score >= 80) return "Excellent consistency!";
    if (score >= 60) return "Good consistency";
    if (score >= 40) return "Room for improvement";
    return "Focus on consistency";
  };

  // Get top 3 most active hours
  const topHours = Object.entries(analysis.hourlyDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));

  return (
    <Card className="frequency-analysis">
      <Card.Header>
        <Card.Title className="mb-0">📊 Frequency Analysis</Card.Title>
      </Card.Header>
      <Card.Body>
        {/* Consistency Score */}
        <div className="consistency-score">
          <div className="score-header">
            <span>Consistency Score</span>
            <span
              className="score-value"
              style={{ color: getConsistencyColor(analysis.consistencyScore) }}
            >
              {analysis.consistencyScore}%
            </span>
          </div>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{
                width: `${analysis.consistencyScore}%`,
                backgroundColor: getConsistencyColor(analysis.consistencyScore),
              }}
            />
          </div>
          <div className="score-message">
            {getConsistencyMessage(analysis.consistencyScore)}
          </div>
        </div>

        {/* Key Stats */}
        <div className="frequency-stats">
          <div className="stat-item">
            <div className="stat-icon">🏋️‍♂️</div>
            <div className="stat-info">
              <div className="stat-value">{analysis.totalWorkouts}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-value">{analysis.averagePerWeek}</div>
              <div className="stat-label">Per Week</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📆</div>
            <div className="stat-info">
              <div className="stat-value">{analysis.averagePerMonth}</div>
              <div className="stat-label">Per Month</div>
            </div>
          </div>
        </div>

        {/* Most Active Day */}
        <div className="active-patterns">
          <div className="pattern-item">
            <div className="pattern-icon">🗓️</div>
            <div className="pattern-info">
              <div className="pattern-label">Most Active Day</div>
              <div className="pattern-value">{analysis.mostActiveDay}</div>
            </div>
          </div>
          <div className="pattern-item">
            <div className="pattern-icon">🕐</div>
            <div className="pattern-info">
              <div className="pattern-label">Peak Hour</div>
              <div className="pattern-value">
                {getHourLabel(analysis.mostActiveHour)}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Distribution */}
        <div className="weekly-distribution">
          <h6>Weekly Pattern</h6>
          <div className="distribution-chart">
            {Object.entries(analysis.weeklyDistribution).map(([day, count]) => {
              const maxCount = Math.max(
                ...Object.values(analysis.weeklyDistribution)
              );
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={day} className="day-column">
                  <div className="day-bar">
                    <div
                      className="day-fill"
                      style={{
                        height: `${percentage}%`,
                        backgroundColor:
                          day === analysis.mostActiveDay
                            ? "#3498db"
                            : "#bdc3c7",
                      }}
                    />
                  </div>
                  <div className="day-count">{count}</div>
                  <div className="day-name">{getDayAbbr(day)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Active Hours */}
        <div className="top-hours">
          <h6>Peak Hours</h6>
          <div className="hours-list">
            {topHours.map((hourData, index) => (
              <div key={hourData.hour} className="hour-item">
                <div className="hour-rank">#{index + 1}</div>
                <div className="hour-info">
                  <div className="hour-time">{getHourLabel(hourData.hour)}</div>
                  <div className="hour-count">{hourData.count} workouts</div>
                </div>
                <div className="hour-bar">
                  <div
                    className="hour-fill"
                    style={{
                      width: `${(hourData.count / topHours[0].count) * 100}%`,
                      backgroundColor:
                        index === 0
                          ? "#e74c3c"
                          : index === 1
                          ? "#f39c12"
                          : "#3498db",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="frequency-insights">
          <h6>💡 Insights</h6>
          <div className="insights-list">
            {analysis.consistencyScore < 50 && (
              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <span>
                  Try to maintain at least 3 workouts per week for better
                  consistency.
                </span>
              </div>
            )}
            {analysis.averagePerWeek > 5 && (
              <div className="insight-item">
                <span className="insight-icon">⚠️</span>
                <span>
                  Great frequency! Make sure to include rest days to prevent
                  burnout.
                </span>
              </div>
            )}
            {analysis.mostActiveHour >= 18 && analysis.mostActiveHour <= 20 && (
              <div className="insight-item">
                <span className="insight-icon">🌆</span>
                <span>
                  Evening workouts are your sweet spot! Keep this routine going.
                </span>
              </div>
            )}
            {analysis.mostActiveHour >= 6 && analysis.mostActiveHour <= 9 && (
              <div className="insight-item">
                <span className="insight-icon">🌅</span>
                <span>
                  You're an early bird! Morning workouts are a great way to
                  start the day.
                </span>
              </div>
            )}
            <div className="insight-item">
              <span className="insight-icon">🎯</span>
              <span>
                Your most productive day is {analysis.mostActiveDay}. Plan
                important workouts then!
              </span>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FrequencyAnalysis;
