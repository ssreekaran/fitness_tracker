/**
 * Streak Analysis Component
 *
 * Displays workout streak information with:
 * - Current streak visualization
 * - Streak history
 * - Streak patterns
 */

import React from "react";
import { Card } from "react-bootstrap";
import "./StreakAnalysis.css";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakHistory: { start: string; end: string; length: number }[];
}

interface StreakAnalysisProps {
  streakData: StreakData;
}

const StreakAnalysis: React.FC<StreakAnalysisProps> = ({ streakData }) => {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥🔥🔥";
    if (streak >= 14) return "🔥🔥";
    if (streak >= 7) return "🔥";
    if (streak >= 3) return "⚡";
    return "💪";
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Incredible dedication!";
    if (streak >= 14) return "You're on fire!";
    if (streak >= 7) return "Great momentum!";
    if (streak >= 3) return "Building consistency!";
    if (streak >= 1) return "Keep it up!";
    return "Start your streak today!";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStreakColor = (length: number) => {
    if (length >= 30) return "#e74c3c";
    if (length >= 14) return "#f39c12";
    if (length >= 7) return "#f1c40f";
    if (length >= 3) return "#3498db";
    return "#95a5a6";
  };

  return (
    <Card className="streak-analysis">
      <Card.Header>
        <Card.Title className="mb-0">🔥 Streak Analysis</Card.Title>
      </Card.Header>
      <Card.Body>
        {/* Current Streak Display */}
        <div className="current-streak">
          <div className="streak-visual">
            <div className="streak-emoji">
              {getStreakEmoji(streakData.currentStreak)}
            </div>
            <div className="streak-number">{streakData.currentStreak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
          <div className="streak-message">
            {getStreakMessage(streakData.currentStreak)}
          </div>
        </div>

        {/* Streak Stats */}
        <div className="streak-stats">
          <div className="stat-item">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-value">{streakData.longestStreak}</div>
              <div className="stat-label">Longest Streak</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-value">
                {streakData.streakHistory.length}
              </div>
              <div className="stat-label">Total Streaks</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-value">
                {streakData.streakHistory.length > 0
                  ? Math.round(
                      streakData.streakHistory.reduce(
                        (sum, s) => sum + s.length,
                        0
                      ) / streakData.streakHistory.length
                    )
                  : 0}
              </div>
              <div className="stat-label">Avg Length</div>
            </div>
          </div>
        </div>

        {/* Streak Progress Bar */}
        <div className="streak-progress">
          <div className="progress-label">Progress to next milestone</div>
          <div className="progress-bar">
            {(() => {
              let nextMilestone = 7;
              if (streakData.currentStreak >= 30) nextMilestone = 60;
              else if (streakData.currentStreak >= 14) nextMilestone = 30;
              else if (streakData.currentStreak >= 7) nextMilestone = 14;

              const progress = (streakData.currentStreak / nextMilestone) * 100;

              return (
                <>
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                  <div className="progress-text">
                    {streakData.currentStreak} / {nextMilestone} days
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Streak History */}
        {streakData.streakHistory.length > 0 && (
          <div className="streak-history">
            <h6>Recent Streaks</h6>
            <div className="history-list">
              {streakData.streakHistory.slice(0, 5).map((streak, index) => (
                <div key={index} className="history-item">
                  <div className="history-bar">
                    <div
                      className="history-fill"
                      style={{
                        width: `${
                          (streak.length / streakData.longestStreak) * 100
                        }%`,
                        backgroundColor: getStreakColor(streak.length),
                      }}
                    />
                  </div>
                  <div className="history-info">
                    <div className="history-length">
                      {streak.length} days {getStreakEmoji(streak.length)}
                    </div>
                    <div className="history-dates">
                      {formatDate(streak.start)} - {formatDate(streak.end)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak Tips */}
        <div className="streak-tips">
          <h6>💡 Streak Tips</h6>
          <div className="tips-list">
            {streakData.currentStreak === 0 && (
              <div className="tip-item">
                <span className="tip-icon">🚀</span>
                <span>
                  Start with just 15 minutes of exercise to begin your streak!
                </span>
              </div>
            )}
            {streakData.currentStreak > 0 && streakData.currentStreak < 7 && (
              <div className="tip-item">
                <span className="tip-icon">📅</span>
                <span>
                  Plan your workouts in advance to maintain consistency.
                </span>
              </div>
            )}
            {streakData.currentStreak >= 7 && (
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <span>
                  Great job! Consider adding variety to keep things interesting.
                </span>
              </div>
            )}
            <div className="tip-item">
              <span className="tip-icon">💪</span>
              <span>
                Remember: rest days are important too! Active recovery counts.
              </span>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StreakAnalysis;
