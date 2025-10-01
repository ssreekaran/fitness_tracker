/**
 * Predictive Insights Component
 *
 * Displays AI-powered predictions and recommendations:
 * - Goal achievement likelihood
 * - Suggested workout days
 * - Burnout risk assessment
 * - Future trends
 */

import React from "react";
import { Card, ProgressBar } from "react-bootstrap";
import { WorkoutFrequencyAnalysis } from "../../services/analyticsService";
import "./PredictiveInsights.css";

interface PredictiveInsightsData {
  weeklyGoalLikelihood: number;
  monthlyGoalLikelihood: number;
  suggestedWorkoutDays: string[];
  burnoutRisk: "low" | "medium" | "high";
}

interface PredictiveInsightsProps {
  insights: PredictiveInsightsData;
  frequencyAnalysis: WorkoutFrequencyAnalysis;
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({
  insights,
  frequencyAnalysis,
}) => {
  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 80) return "success";
    if (likelihood >= 60) return "warning";
    if (likelihood >= 40) return "info";
    return "danger";
  };

  const getLikelihoodMessage = (likelihood: number) => {
    if (likelihood >= 80) return "Very Likely";
    if (likelihood >= 60) return "Likely";
    if (likelihood >= 40) return "Possible";
    return "Unlikely";
  };

  const getBurnoutRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "#2ecc71";
      case "medium":
        return "#f39c12";
      case "high":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getBurnoutRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return "😊";
      case "medium":
        return "😐";
      case "high":
        return "😰";
      default:
        return "😐";
    }
  };

  const getBurnoutRiskMessage = (risk: string) => {
    switch (risk) {
      case "low":
        return "You're maintaining a healthy balance!";
      case "medium":
        return "Consider adding more rest days to your routine.";
      case "high":
        return "Take a break! Your body needs time to recover.";
      default:
        return "Keep monitoring your workout intensity.";
    }
  };

  const getDayEmoji = (day: string) => {
    const dayEmojis: { [key: string]: string } = {
      Monday: "💪",
      Tuesday: "🔥",
      Wednesday: "⚡",
      Thursday: "🎯",
      Friday: "🚀",
      Saturday: "🏋️‍♂️",
      Sunday: "🌟",
    };
    return dayEmojis[day] || "📅";
  };

  return (
    <div className="predictive-insights">
      <Card className="prediction-card">
        <Card.Header>
          <Card.Title className="mb-0">🔮 Predictive Insights</Card.Title>
        </Card.Header>
        <Card.Body>
          {/* Goal Achievement Predictions */}
          <div className="prediction-section">
            <h6>🎯 Goal Achievement Predictions</h6>

            <div className="prediction-item">
              <div className="prediction-header">
                <span>Weekly Goal Achievement</span>
                <span className="prediction-percentage">
                  {insights.weeklyGoalLikelihood}%
                </span>
              </div>
              <ProgressBar
                variant={getLikelihoodColor(insights.weeklyGoalLikelihood)}
                now={insights.weeklyGoalLikelihood}
                className="prediction-bar"
              />
              <div className="prediction-message">
                {getLikelihoodMessage(insights.weeklyGoalLikelihood)} to achieve
                your weekly goals
              </div>
            </div>

            <div className="prediction-item">
              <div className="prediction-header">
                <span>Monthly Goal Achievement</span>
                <span className="prediction-percentage">
                  {insights.monthlyGoalLikelihood}%
                </span>
              </div>
              <ProgressBar
                variant={getLikelihoodColor(insights.monthlyGoalLikelihood)}
                now={insights.monthlyGoalLikelihood}
                className="prediction-bar"
              />
              <div className="prediction-message">
                {getLikelihoodMessage(insights.monthlyGoalLikelihood)} to
                achieve your monthly goals
              </div>
            </div>
          </div>

          {/* Burnout Risk Assessment */}
          <div className="prediction-section">
            <h6>⚠️ Burnout Risk Assessment</h6>
            <div className="burnout-assessment">
              <div className="burnout-visual">
                <div
                  className="burnout-circle"
                  style={{
                    borderColor: getBurnoutRiskColor(insights.burnoutRisk),
                  }}
                >
                  <div className="burnout-emoji">
                    {getBurnoutRiskIcon(insights.burnoutRisk)}
                  </div>
                  <div className="burnout-level">
                    {insights.burnoutRisk.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="burnout-info">
                <div className="burnout-message">
                  {getBurnoutRiskMessage(insights.burnoutRisk)}
                </div>
                <div className="burnout-stats">
                  <small>
                    Based on {frequencyAnalysis.averagePerWeek.toFixed(1)}{" "}
                    workouts/week
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Workout Days */}
          <div className="prediction-section">
            <h6>📅 Optimal Workout Days</h6>
            <div className="suggested-days">
              {insights.suggestedWorkoutDays.map((day, index) => (
                <div key={day} className="suggested-day">
                  <div className="day-emoji">{getDayEmoji(day)}</div>
                  <div className="day-name">{day}</div>
                  <div className="day-rank">#{index + 1}</div>
                </div>
              ))}
            </div>
            <div className="suggestion-note">
              <small>
                Based on your historical workout patterns, these are your most
                productive days.
              </small>
            </div>
          </div>

          {/* Future Trends */}
          <div className="prediction-section">
            <h6>📈 Trend Predictions</h6>
            <div className="trend-predictions">
              <div className="trend-item">
                <div className="trend-icon">📊</div>
                <div className="trend-info">
                  <div className="trend-title">Consistency Trend</div>
                  <div className="trend-prediction">
                    {frequencyAnalysis.consistencyScore >= 70
                      ? "Likely to maintain current consistency"
                      : "May improve with focused effort"}
                  </div>
                </div>
              </div>

              <div className="trend-item">
                <div className="trend-icon">🔥</div>
                <div className="trend-info">
                  <div className="trend-title">Motivation Level</div>
                  <div className="trend-prediction">
                    {insights.weeklyGoalLikelihood >= 70
                      ? "High motivation expected to continue"
                      : "May need motivational boost"}
                  </div>
                </div>
              </div>

              <div className="trend-item">
                <div className="trend-icon">🎯</div>
                <div className="trend-info">
                  <div className="trend-title">Goal Difficulty</div>
                  <div className="trend-prediction">
                    {insights.weeklyGoalLikelihood < 50
                      ? "Consider adjusting goals to be more achievable"
                      : "Current goals are well-suited to your ability"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="prediction-section">
            <h6>🤖 AI Recommendations</h6>
            <div className="ai-recommendations">
              {insights.weeklyGoalLikelihood < 60 && (
                <div className="recommendation-item">
                  <span className="rec-icon">💡</span>
                  <span>
                    Consider reducing your weekly goal by 1-2 workouts to
                    improve success rate.
                  </span>
                </div>
              )}

              {insights.burnoutRisk === "high" && (
                <div className="recommendation-item">
                  <span className="rec-icon">🛑</span>
                  <span>
                    Take 2-3 rest days this week to prevent overtraining.
                  </span>
                </div>
              )}

              {frequencyAnalysis.consistencyScore < 50 && (
                <div className="recommendation-item">
                  <span className="rec-icon">📅</span>
                  <span>
                    Schedule workouts on {insights.suggestedWorkoutDays[0]} and{" "}
                    {insights.suggestedWorkoutDays[1]} for better consistency.
                  </span>
                </div>
              )}

              {insights.weeklyGoalLikelihood >= 80 && (
                <div className="recommendation-item">
                  <span className="rec-icon">🚀</span>
                  <span>
                    You're doing great! Consider adding a new challenge or goal
                    type.
                  </span>
                </div>
              )}

              <div className="recommendation-item">
                <span className="rec-icon">⏰</span>
                <span>
                  Your peak performance time is around{" "}
                  {frequencyAnalysis.mostActiveHour}:00. Plan important workouts
                  then!
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PredictiveInsights;
