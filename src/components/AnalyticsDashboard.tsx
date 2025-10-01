/**
 * Analytics Dashboard Component
 *
 * Comprehensive fitness analytics dashboard with:
 * - Workout trends and patterns
 * - Goal achievement analytics
 * - Performance insights
 * - Calorie burn analysis
 * - Predictive insights
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Tabs,
  Tab,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  getAnalyticsDashboard,
  AnalyticsDashboard as AnalyticsDashboardData,
  AnalyticsPeriod,
} from "../services/analyticsService";
// Temporarily comment out complex components and create simple versions
// import TrendChart from "./analytics/TrendChart";
// import GoalProgressChart from "./analytics/GoalProgressChart";
// import CalorieBurnHeatmap from "./analytics/CalorieBurnHeatmap";
// import StreakAnalysis from "./analytics/StreakAnalysis";
// import PerformanceInsights from "./analytics/PerformanceInsights";
// import FrequencyAnalysis from "./analytics/FrequencyAnalysis";
// import PredictiveInsights from "./analytics/PredictiveInsights";
import "./AnalyticsDashboard.css";

// Simple inline components for now
const TrendChart: React.FC<{ data: any[]; period: AnalyticsPeriod }> = ({
  data,
}) => (
  <div className="trend-chart-simple">
    <div className="chart-placeholder">
      <div className="chart-icon">📈</div>
      <h5>Workout Trends</h5>
      <p>
        Total workouts:{" "}
        {data.reduce((sum: number, d: any) => sum + d.workouts, 0)}
      </p>
      <p>
        Total calories:{" "}
        {data
          .reduce((sum: number, d: any) => sum + d.calories, 0)
          .toLocaleString()}
      </p>
      <p>
        Total duration:{" "}
        {Math.round(
          data.reduce((sum: number, d: any) => sum + d.duration, 0) / 60
        )}
        h
      </p>
    </div>
  </div>
);

const GoalProgressChart: React.FC<{ goals: any[] }> = ({ goals }) => (
  <div className="goal-progress-simple">
    <div className="goals-list-simple">
      {goals.map((goal) => (
        <div key={goal.goalId} className="goal-item-simple">
          <div className="goal-name">{goal.goalName}</div>
          <div className="goal-progress">
            <div className="progress-bar-simple">
              <div
                className="progress-fill-simple"
                style={{ width: `${Math.min(100, goal.completionRate || 0)}%` }}
              />
            </div>
            <span className="progress-text">{goal.completionRate || 0}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CalorieBurnHeatmap: React.FC<{
  trends: any;
  insights: any;
}> = ({ insights }) => (
  <div className="calorie-heatmap-simple">
    <div className="heatmap-placeholder">
      <div className="heatmap-icon">🔥</div>
      <h6>Calorie Insights</h6>
      <div className="calorie-stats">
        <div>Total: {insights.totalCalories?.toLocaleString() || 0}</div>
        <div>Avg/workout: {insights.averagePerWorkout || 0}</div>
        <div>Best day: {insights.bestDay?.calories || 0} calories</div>
      </div>
    </div>
  </div>
);

const StreakAnalysis: React.FC<{ streakData: any }> = ({ streakData }) => (
  <Card className="streak-analysis-simple">
    <Card.Header>
      <Card.Title className="mb-0">🔥 Streak Analysis</Card.Title>
    </Card.Header>
    <Card.Body>
      <div className="streak-display">
        <div className="streak-current">
          <div className="streak-number">{streakData.currentStreak}</div>
          <div className="streak-label">Current Streak</div>
        </div>
        <div className="streak-best">
          <div className="streak-number">{streakData.longestStreak}</div>
          <div className="streak-label">Best Streak</div>
        </div>
      </div>
    </Card.Body>
  </Card>
);

const PerformanceInsights: React.FC<{ insights: any }> = ({ insights }) => (
  <Card className="performance-insights-simple">
    <Card.Header>
      <Card.Title className="mb-0">🎯 Performance Insights</Card.Title>
    </Card.Header>
    <Card.Body>
      <div className="motivational-message-simple">
        <div className="message-icon">🌟</div>
        <div className="message-text">
          {insights.motivationalMessage || "Keep up the great work!"}
        </div>
      </div>

      {insights.strengths?.length > 0 && (
        <div className="insights-section">
          <h6>💪 Strengths</h6>
          {insights.strengths?.map((strength: string, index: number) => (
            <div key={index} className="insight-item-simple strength">
              {strength}
            </div>
          ))}
        </div>
      )}

      {insights.recommendations?.length > 0 && (
        <div className="insights-section">
          <h6>💡 Recommendations</h6>
          {insights.recommendations?.map((rec: string, index: number) => (
            <div key={index} className="insight-item-simple recommendation">
              {rec}
            </div>
          ))}
        </div>
      )}
    </Card.Body>
  </Card>
);

const FrequencyAnalysis: React.FC<{ analysis: any }> = ({ analysis }) => (
  <Card className="frequency-analysis-simple">
    <Card.Header>
      <Card.Title className="mb-0">📊 Frequency Analysis</Card.Title>
    </Card.Header>
    <Card.Body>
      <div className="frequency-stats-simple">
        <div className="stat-item-simple">
          <div className="stat-value">{analysis.consistencyScore || 0}%</div>
          <div className="stat-label">Consistency</div>
        </div>
        <div className="stat-item-simple">
          <div className="stat-value">{analysis.averagePerWeek}</div>
          <div className="stat-label">Per Week</div>
        </div>
        <div className="stat-item-simple">
          <div className="stat-value">{analysis.mostActiveDay}</div>
          <div className="stat-label">Best Day</div>
        </div>
      </div>
    </Card.Body>
  </Card>
);

const PredictiveInsights: React.FC<{
  insights: any;
  frequencyAnalysis: any;
}> = ({ insights }) => (
  <Card className="predictive-insights-simple">
    <Card.Header>
      <Card.Title className="mb-0">🔮 Predictions</Card.Title>
    </Card.Header>
    <Card.Body>
      <div className="predictions-simple">
        <div className="prediction-item-simple">
          <div className="prediction-label">Weekly Goal Success</div>
          <div className="prediction-value">
            {insights.weeklyGoalLikelihood}%
          </div>
        </div>
        <div className="prediction-item-simple">
          <div className="prediction-label">Monthly Goal Success</div>
          <div className="prediction-value">
            {insights.monthlyGoalLikelihood}%
          </div>
        </div>
        <div className="prediction-item-simple">
          <div className="prediction-label">Burnout Risk</div>
          <div className={`prediction-value risk-${insights.burnoutRisk}`}>
            {insights.burnoutRisk.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="suggested-days-simple">
        <h6>Optimal Days</h6>
        <div className="days-list">
          {insights.suggestedWorkoutDays.map((day: string) => (
            <span key={day} className="day-tag">
              {day}
            </span>
          ))}
        </div>
      </div>
    </Card.Body>
  </Card>
);

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className,
}) => {
  const [dashboardData, setDashboardData] =
    useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const periodOptions = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
    { value: "all", label: "All Time" },
  ];

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalyticsDashboard(selectedPeriod);
      setDashboardData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load analytics data"
      );
      console.error("Error loading analytics dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <Card className={`analytics-dashboard ${className || ""}`}>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0">Loading your fitness analytics...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`analytics-dashboard ${className || ""}`}>
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Unable to Load Analytics</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={handleRefresh}>
              Try Again
            </Button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card className={`analytics-dashboard ${className || ""}`}>
        <Card.Body>
          <Alert variant="info">
            <Alert.Heading>No Data Available</Alert.Heading>
            <p>Start logging workouts to see your analytics dashboard!</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className={`analytics-dashboard ${className || ""}`}>
      {/* Dashboard Header */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h3 className="mb-1">📊 Fitness Analytics Dashboard</h3>
              <p className="text-muted mb-0">
                Insights and trends from your fitness journey
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {/* Period Selector */}
              <div className="btn-group" role="group">
                {periodOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      selectedPeriod === option.value
                        ? "primary"
                        : "outline-primary"
                    }
                    size="sm"
                    onClick={() =>
                      handlePeriodChange(option.value as AnalyticsPeriod)
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleRefresh}
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Analytics Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || "overview")}
        className="mb-4 analytics-tabs"
      >
        {/* Overview Tab */}
        <Tab eventKey="overview" title="📈 Overview">
          <Row className="g-4">
            {/* Key Metrics Cards */}
            <Col lg={3} md={6}>
              <Card className="metric-card metric-card--workouts">
                <Card.Body>
                  <div className="metric-icon">🏋️‍♂️</div>
                  <div className="metric-value">
                    {dashboardData.frequencyAnalysis.totalWorkouts}
                  </div>
                  <div className="metric-label">Total Workouts</div>
                  <div className="metric-change">
                    {dashboardData.frequencyAnalysis.averagePerWeek.toFixed(1)}{" "}
                    per week
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="metric-card metric-card--calories">
                <Card.Body>
                  <div className="metric-icon">🔥</div>
                  <div className="metric-value">
                    {dashboardData.calorieBurnInsights.totalCalories.toLocaleString()}
                  </div>
                  <div className="metric-label">Calories Burned</div>
                  <div className="metric-change">
                    {dashboardData.calorieBurnInsights.averagePerDay.toFixed(0)}{" "}
                    per day
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="metric-card metric-card--streak">
                <Card.Body>
                  <div className="metric-icon">🔥</div>
                  <div className="metric-value">
                    {dashboardData.streakAnalysis.currentStreak}
                  </div>
                  <div className="metric-label">Current Streak</div>
                  <div className="metric-change">
                    Best: {dashboardData.streakAnalysis.longestStreak} days
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="metric-card metric-card--consistency">
                <Card.Body>
                  <div className="metric-icon">📊</div>
                  <div className="metric-value">
                    {dashboardData.frequencyAnalysis.consistencyScore}%
                  </div>
                  <div className="metric-label">Consistency Score</div>
                  <div className="metric-change">
                    {dashboardData.frequencyAnalysis.consistencyScore >= 70
                      ? "Excellent"
                      : dashboardData.frequencyAnalysis.consistencyScore >= 50
                      ? "Good"
                      : "Needs Work"}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Workout Trends Chart */}
            <Col lg={8}>
              <Card className="chart-card">
                <Card.Header>
                  <Card.Title className="mb-0">📈 Workout Trends</Card.Title>
                </Card.Header>
                <Card.Body>
                  <TrendChart
                    data={dashboardData.workoutTrends}
                    period={selectedPeriod}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Performance Insights */}
            <Col lg={4}>
              <PerformanceInsights
                insights={dashboardData.performanceInsights}
              />
            </Col>

            {/* Goal Progress */}
            <Col lg={6}>
              <Card className="chart-card">
                <Card.Header>
                  <Card.Title className="mb-0">🎯 Goal Progress</Card.Title>
                </Card.Header>
                <Card.Body>
                  <GoalProgressChart goals={dashboardData.goalAnalytics} />
                </Card.Body>
              </Card>
            </Col>

            {/* Streak Analysis */}
            <Col lg={6}>
              <StreakAnalysis streakData={dashboardData.streakAnalysis} />
            </Col>
          </Row>
        </Tab>

        {/* Detailed Analytics Tab */}
        <Tab eventKey="detailed" title="🔍 Detailed">
          <Row className="g-4">
            {/* Calorie Burn Heatmap */}
            <Col lg={8}>
              <Card className="chart-card">
                <Card.Header>
                  <Card.Title className="mb-0">
                    🔥 Calorie Burn Heatmap
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <CalorieBurnHeatmap
                    trends={dashboardData.workoutTrends}
                    insights={dashboardData.calorieBurnInsights}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Frequency Analysis */}
            <Col lg={4}>
              <FrequencyAnalysis analysis={dashboardData.frequencyAnalysis} />
            </Col>

            {/* Top Exercises */}
            <Col lg={6}>
              <Card className="chart-card">
                <Card.Header>
                  <Card.Title className="mb-0">🏆 Top Exercises</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="top-exercises">
                    {dashboardData.calorieBurnInsights.topExercises.map(
                      (exercise, index) => (
                        <div key={exercise.exercise} className="exercise-item">
                          <div className="exercise-rank">#{index + 1}</div>
                          <div className="exercise-info">
                            <div className="exercise-name">
                              {exercise.exercise}
                            </div>
                            <div className="exercise-stats">
                              {exercise.calories.toLocaleString()} calories •{" "}
                              {exercise.count} sessions
                            </div>
                          </div>
                          <div className="exercise-progress">
                            <div
                              className="progress-bar"
                              style={{
                                width: `${
                                  (exercise.calories /
                                    dashboardData.calorieBurnInsights
                                      .topExercises[0].calories) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Weekly Distribution */}
            <Col lg={6}>
              <Card className="chart-card">
                <Card.Header>
                  <Card.Title className="mb-0">
                    📅 Weekly Distribution
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="weekly-distribution">
                    {Object.entries(
                      dashboardData.frequencyAnalysis.weeklyDistribution
                    ).map(([day, count]) => (
                      <div key={day} className="day-item">
                        <div className="day-name">{day.slice(0, 3)}</div>
                        <div className="day-bar">
                          <div
                            className="day-fill"
                            style={{
                              height: `${
                                (count /
                                  Math.max(
                                    ...Object.values(
                                      dashboardData.frequencyAnalysis
                                        .weeklyDistribution
                                    )
                                  )) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="day-count">{count}</div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Predictions Tab */}
        <Tab eventKey="predictions" title="🔮 Predictions">
          <Row className="g-4">
            <Col lg={8}>
              <PredictiveInsights
                insights={dashboardData.predictiveInsights}
                frequencyAnalysis={dashboardData.frequencyAnalysis}
              />
            </Col>
            <Col lg={4}>
              <Card className="insight-card">
                <Card.Header>
                  <Card.Title className="mb-0">
                    💡 Smart Recommendations
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="recommendations">
                    {dashboardData.performanceInsights.recommendations.map(
                      (rec, index) => (
                        <div key={index} className="recommendation-item">
                          <div className="recommendation-icon">💡</div>
                          <div className="recommendation-text">{rec}</div>
                        </div>
                      )
                    )}
                    {dashboardData.performanceInsights.recommendations
                      .length === 0 && (
                      <div className="text-muted text-center py-3">
                        Keep up the great work! No specific recommendations at
                        this time.
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
