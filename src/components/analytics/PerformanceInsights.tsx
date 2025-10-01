/**
 * Performance Insights Component
 *
 * Displays AI-generated performance insights with:
 * - Strengths and improvement areas
 * - Recommendations
 * - Risk factors
 * - Motivational messages
 */

import React from "react";
import { Card } from "react-bootstrap";
import { PerformanceInsights as PerformanceInsightsData } from "../../services/analyticsService";
import "./PerformanceInsights.css";

interface PerformanceInsightsProps {
  insights: PerformanceInsightsData;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  insights,
}) => {
  const getInsightIcon = (
    type: "strength" | "improvement" | "recommendation" | "risk"
  ) => {
    switch (type) {
      case "strength":
        return "💪";
      case "improvement":
        return "📈";
      case "recommendation":
        return "💡";
      case "risk":
        return "⚠️";
      default:
        return "📊";
    }
  };

  const getInsightColor = (
    type: "strength" | "improvement" | "recommendation" | "risk"
  ) => {
    switch (type) {
      case "strength":
        return "#2ecc71";
      case "improvement":
        return "#3498db";
      case "recommendation":
        return "#f39c12";
      case "risk":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  return (
    <Card className="performance-insights">
      <Card.Header>
        <Card.Title className="mb-0">🎯 Performance Insights</Card.Title>
      </Card.Header>
      <Card.Body>
        {/* Motivational Message */}
        <div className="motivational-message">
          <div className="message-icon">🌟</div>
          <div className="message-text">{insights.motivationalMessage}</div>
        </div>

        {/* Strengths */}
        {insights.strengths.length > 0 && (
          <div className="insight-section">
            <div className="section-header">
              <span className="section-icon">{getInsightIcon("strength")}</span>
              <span className="section-title">Your Strengths</span>
            </div>
            <div className="insight-list">
              {insights.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="insight-item insight-item--strength"
                  style={{ borderLeftColor: getInsightColor("strength") }}
                >
                  <div className="insight-text">{strength}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Areas */}
        {insights.improvementAreas.length > 0 && (
          <div className="insight-section">
            <div className="section-header">
              <span className="section-icon">
                {getInsightIcon("improvement")}
              </span>
              <span className="section-title">Areas to Improve</span>
            </div>
            <div className="insight-list">
              {insights.improvementAreas.map((area, index) => (
                <div
                  key={index}
                  className="insight-item insight-item--improvement"
                  style={{ borderLeftColor: getInsightColor("improvement") }}
                >
                  <div className="insight-text">{area}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="insight-section">
            <div className="section-header">
              <span className="section-icon">
                {getInsightIcon("recommendation")}
              </span>
              <span className="section-title">Recommendations</span>
            </div>
            <div className="insight-list">
              {insights.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="insight-item insight-item--recommendation"
                  style={{ borderLeftColor: getInsightColor("recommendation") }}
                >
                  <div className="insight-text">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {insights.riskFactors.length > 0 && (
          <div className="insight-section">
            <div className="section-header">
              <span className="section-icon">{getInsightIcon("risk")}</span>
              <span className="section-title">Watch Out For</span>
            </div>
            <div className="insight-list">
              {insights.riskFactors.map((risk, index) => (
                <div
                  key={index}
                  className="insight-item insight-item--risk"
                  style={{ borderLeftColor: getInsightColor("risk") }}
                >
                  <div className="insight-text">{risk}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Score */}
        <div className="performance-score">
          <div className="score-header">Overall Performance</div>
          <div className="score-visual">
            {(() => {
              const strengthsCount = insights.strengths.length;
              const improvementsCount = insights.improvementAreas.length;
              const risksCount = insights.riskFactors.length;

              let score = 50; // Base score
              score += strengthsCount * 15; // +15 per strength
              score -= improvementsCount * 8; // -8 per improvement area
              score -= risksCount * 12; // -12 per risk factor
              score = Math.max(0, Math.min(100, score)); // Clamp between 0-100

              let scoreColor = "#e74c3c"; // Red
              let scoreEmoji = "😟";

              if (score >= 80) {
                scoreColor = "#2ecc71"; // Green
                scoreEmoji = "🎉";
              } else if (score >= 60) {
                scoreColor = "#f39c12"; // Orange
                scoreEmoji = "😊";
              } else if (score >= 40) {
                scoreColor = "#3498db"; // Blue
                scoreEmoji = "🙂";
              }

              return (
                <>
                  <div className="score-circle">
                    <div
                      className="score-fill"
                      style={{
                        background: `conic-gradient(${scoreColor} ${
                          score * 3.6
                        }deg, #f8f9fa 0deg)`,
                      }}
                    />
                    <div className="score-content">
                      <div className="score-emoji">{scoreEmoji}</div>
                      <div className="score-number">{Math.round(score)}</div>
                    </div>
                  </div>
                  <div className="score-label">
                    {score >= 80
                      ? "Excellent!"
                      : score >= 60
                      ? "Good Progress"
                      : score >= 40
                      ? "Keep Improving"
                      : "Focus Needed"}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* No Insights Message */}
        {insights.strengths.length === 0 &&
          insights.improvementAreas.length === 0 &&
          insights.recommendations.length === 0 &&
          insights.riskFactors.length === 0 && (
            <div className="no-insights">
              <div className="no-insights-icon">📊</div>
              <p>Complete more workouts to get personalized insights!</p>
              <small className="text-muted">
                We need at least a week of data to provide meaningful analysis.
              </small>
            </div>
          )}
      </Card.Body>
    </Card>
  );
};

export default PerformanceInsights;
