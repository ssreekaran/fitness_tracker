/**
 * GoalsManager Component
 *
 * A comprehensive fitness goals management system that allows users to:
 * - View and edit overall fitness goal settings
 * - Create, edit, and delete custom fitness goals
 * - Track progress across different goal types (weekly, monthly, streak)
 * - Manage goal categories (workout, calories, duration, custom)
 *
 * Features:
 * - Real-time goal updates with Firestore synchronization
 * - Multiple goal types and tracking periods
 * - Visual progress indicators and status tags
 * - Modal-based editing interface
 * - Error handling and user feedback
 * - Responsive design with Ant Design components
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Form,
  InputNumber,
  Select,
  Input,
  Switch,
  Modal,
  List,
  message,
  Popconfirm,
  Row,
  Col,
  Tag,
  Alert,
} from "antd";
import "./GoalsManager.css";
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  StarOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  getUserGoals,
  updateUserGoals,
  addSmartGoal,
  updateSmartGoal,
  deleteCustomGoal,
  adjustGoalDifficulty,
  completeMilestone,
  getGoalSuggestions,
  UserGoals,
  SmartGoal,
  GoalDifficulty,
  GoalPriority,
} from "../services/goalsService";

const { Text } = Typography;
const { Option } = Select;

/**
 * Props interface for GoalsManager component
 */
interface GoalsManagerProps {
  onGoalsUpdate?: () => void; // Callback fired when goals are updated (for parent component refresh)
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ onGoalsUpdate }) => {
  // Main goals state
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [achievementsVisible, setAchievementsVisible] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SmartGoal | null>(null);
  const [goalSuggestions, setGoalSuggestions] = useState<Partial<SmartGoal>[]>(
    []
  );
  const [form] = Form.useForm();
  const [basicForm] = Form.useForm();

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const userGoals = await getUserGoals();
      setGoals(userGoals);

      // Set form values for basic settings
      basicForm.setFieldsValue({
        weeklyWorkoutTarget: userGoals.weeklyWorkoutTarget,
        weeklyGoalThreshold: userGoals.weeklyGoalThreshold,
        goalTrackingWeeks: userGoals.goalTrackingWeeks,
      });

      // Load goal suggestions
      const suggestions = await getGoalSuggestions();
      setGoalSuggestions(suggestions);
    } catch (error) {
      message.error("Failed to load goals");
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  }, [basicForm]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleBasicSettingsUpdate = async (values: {
    weeklyWorkoutTarget: number;
    weeklyGoalThreshold: number;
    goalTrackingWeeks: number;
  }) => {
    try {
      setSaving(true);
      await updateUserGoals({
        weeklyWorkoutTarget: values.weeklyWorkoutTarget,
        weeklyGoalThreshold: values.weeklyGoalThreshold,
        goalTrackingWeeks: values.goalTrackingWeeks,
      });
      message.success("Basic settings updated successfully");
      await loadGoals();
      onGoalsUpdate?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update basic settings";
      if (errorMessage.includes("database access restricted")) {
        message.warning(
          "Settings are read-only due to database permissions. Goals are still being tracked locally."
        );
      } else {
        message.error("Failed to update basic settings");
      }
      console.error("Error updating basic settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    form.resetFields();
    form.setFieldsValue({
      type: "weekly",
      category: "workout",
      isActive: true,
      difficulty: "beginner",
      priority: "medium",
      adaptiveTarget: true,
    });
    setModalVisible(true);
  };

  const handleEditGoal = (goal: SmartGoal) => {
    setEditingGoal(goal);
    form.setFieldsValue({
      ...goal,
      reminderEnabled: goal.reminderSettings.enabled,
      reminderFrequency: goal.reminderSettings.frequency,
      reminderTime: goal.reminderSettings.time,
    });
    setModalVisible(true);
  };

  const handleAddSuggestedGoal = (suggestion: Partial<SmartGoal>) => {
    setEditingGoal(null);
    form.resetFields();
    form.setFieldsValue({
      ...suggestion,
      reminderEnabled: false,
      reminderFrequency: "weekly",
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Prepare smart goal data
      const goalData = {
        ...values,
        originalTarget: values.target,
        reminderSettings: {
          enabled: values.reminderEnabled || false,
          frequency: values.reminderFrequency || "weekly",
          time: values.reminderTime,
          message: values.reminderMessage,
        },
        milestones: values.milestones || [],
        tags: values.tags
          ? values.tags.split(",").map((tag: string) => tag.trim())
          : [],
      };

      // Remove form-specific fields
      delete goalData.reminderEnabled;
      delete goalData.reminderFrequency;
      delete goalData.reminderTime;
      delete goalData.reminderMessage;

      if (editingGoal) {
        await updateSmartGoal(editingGoal.id, goalData);
        message.success("Goal updated successfully");
      } else {
        await addSmartGoal(goalData);
        message.success("Goal added successfully");
      }

      setModalVisible(false);
      await loadGoals();
      onGoalsUpdate?.();
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        return;
      }
      message.error("Failed to save goal");
      console.error("Error saving goal:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setSaving(true);
      await deleteCustomGoal(goalId);
      message.success("Goal deleted successfully");
      await loadGoals();
      onGoalsUpdate?.();
    } catch (error) {
      message.error("Failed to delete goal");
      console.error("Error deleting goal:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGoal = async (goal: SmartGoal) => {
    try {
      await updateSmartGoal(goal.id, { isActive: !goal.isActive });
      message.success(`Goal ${goal.isActive ? "disabled" : "enabled"}`);
      await loadGoals();
      onGoalsUpdate?.();
    } catch (error) {
      message.error("Failed to toggle goal");
      console.error("Error toggling goal:", error);
    }
  };

  const handleAdjustDifficulty = async (goalId: string) => {
    try {
      setSaving(true);
      await adjustGoalDifficulty(goalId);
      message.success("Goal difficulty adjusted based on your performance");
      await loadGoals();
      onGoalsUpdate?.();
    } catch (error) {
      message.error("Failed to adjust goal difficulty");
      console.error("Error adjusting difficulty:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteMilestone = async (
    goalId: string,
    milestoneId: string
  ) => {
    try {
      await completeMilestone(goalId, milestoneId);
      message.success("Milestone completed! 🎉");
      await loadGoals();
      onGoalsUpdate?.();
    } catch (error) {
      message.error("Failed to complete milestone");
      console.error("Error completing milestone:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "workout":
        return <TrophyOutlined />;
      case "calories":
        return <FireOutlined />;
      case "duration":
        return <ClockCircleOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "workout":
        return "#1890ff";
      case "calories":
        return "#ff4d4f";
      case "duration":
        return "#52c41a";
      case "weight":
        return "#fa8c16";
      case "strength":
        return "#722ed1";
      default:
        return "#13c2c2";
    }
  };

  const getDifficultyColor = (difficulty: GoalDifficulty) => {
    switch (difficulty) {
      case "beginner":
        return "#52c41a";
      case "intermediate":
        return "#1890ff";
      case "advanced":
        return "#fa8c16";
      case "expert":
        return "#f5222d";
      default:
        return "#d9d9d9";
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case "low":
        return "#d9d9d9";
      case "medium":
        return "#1890ff";
      case "high":
        return "#fa8c16";
      case "critical":
        return "#f5222d";
      default:
        return "#d9d9d9";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <RiseOutlined style={{ color: "#52c41a" }} />;
      case "declining":
        return <FallOutlined style={{ color: "#f5222d" }} />;
      default:
        return <MinusOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const getProgressPercentage = (goal: SmartGoal) => {
    return Math.min(100, Math.round((goal.currentValue / goal.target) * 100));
  };

  if (loading) {
    return (
      <Card loading={true}>
        <div style={{ height: "400px" }} />
      </Card>
    );
  }

  return (
    <div>
      {/* Basic Settings */}
      {goals?.id === "default" && (
        <Alert
          message="Read-Only Mode"
          description="Your goals are being tracked locally but cannot be saved due to database permissions. All functionality works normally, but changes won't persist between sessions."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Basic Goal Settings</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          form={basicForm}
          layout="vertical"
          onFinish={handleBasicSettingsUpdate}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Weekly Workout Target"
                name="weeklyWorkoutTarget"
                rules={[{ required: true, message: "Please enter a target" }]}
                tooltip="How many workouts you want to complete each week"
              >
                <InputNumber
                  min={1}
                  max={14}
                  style={{ width: "100%" }}
                  addonAfter="workouts"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Goal Achievement Threshold"
                name="weeklyGoalThreshold"
                rules={[
                  { required: true, message: "Please enter a threshold" },
                ]}
                tooltip="Minimum workouts per week to consider your goal achieved"
              >
                <InputNumber
                  min={1}
                  max={14}
                  style={{ width: "100%" }}
                  addonAfter="workouts"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Tracking Period"
                name="goalTrackingWeeks"
                rules={[
                  { required: true, message: "Please enter tracking weeks" },
                ]}
                tooltip="Number of weeks to track for goal achievement statistics"
              >
                <InputNumber
                  min={1}
                  max={12}
                  style={{ width: "100%" }}
                  addonAfter="weeks"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              Update Basic Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* User Level and Achievements Summary */}
      <Card className="achievements-summary">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <div className="level-display">
              <div className="level-icon">
                <StarOutlined style={{ fontSize: "2rem", color: "#faad14" }} />
              </div>
              <div className="level-info">
                <div className="level-number">Level {goals?.level || 1}</div>
                <div className="level-points">
                  {goals?.totalPoints || 0} points
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="achievements-count">
              <div className="achievement-icon">
                <TrophyOutlined
                  style={{ fontSize: "2rem", color: "#52c41a" }}
                />
              </div>
              <div className="achievement-info">
                <div className="achievement-number">
                  {goals?.achievements?.filter((a) => a.isUnlocked).length || 0}
                </div>
                <div className="achievement-label">Achievements</div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button
                icon={<TrophyOutlined />}
                onClick={() => setAchievementsVisible(true)}
              >
                View Achievements
              </Button>
              <Button
                icon={<BulbOutlined />}
                onClick={() => setSuggestionsVisible(true)}
              >
                Goal Suggestions
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Custom Goals */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>Smart Goals</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<BulbOutlined />}
              onClick={() => setSuggestionsVisible(true)}
            >
              Suggestions
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddGoal}
            >
              Add Goal
            </Button>
          </Space>
        }
      >
        <List
          dataSource={goals?.customGoals || []}
          renderItem={(goal: SmartGoal) => (
            <List.Item
              actions={[
                <Switch
                  checked={goal.isActive}
                  onChange={() => handleToggleGoal(goal)}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />,
                goal.adaptiveTarget && (
                  <Button
                    type="text"
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleAdjustDifficulty(goal.id)}
                    title="Auto-adjust difficulty"
                  />
                ),
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditGoal(goal)}
                />,
                <Popconfirm
                  title="Are you sure you want to delete this goal?"
                  onConfirm={() => handleDeleteGoal(goal.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      backgroundColor: `${getCategoryColor(goal.category)}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getCategoryColor(goal.category),
                      fontSize: "20px",
                      position: "relative",
                    }}
                  >
                    {getCategoryIcon(goal.category)}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: getDifficultyColor(goal.difficulty),
                        border: "2px solid white",
                        fontSize: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {goal.difficulty[0].toUpperCase()}
                    </div>
                  </div>
                }
                title={
                  <Space wrap>
                    <span>{goal.name}</span>
                    <Tag color={getCategoryColor(goal.category)}>
                      {goal.type}
                    </Tag>
                    <Tag color={getDifficultyColor(goal.difficulty)}>
                      {goal.difficulty}
                    </Tag>
                    <Tag color={getPriorityColor(goal.priority)}>
                      {goal.priority} priority
                    </Tag>
                    {goal.adaptiveTarget && (
                      <Tag color="blue" icon={<ThunderboltOutlined />}>
                        Adaptive
                      </Tag>
                    )}
                    {!goal.isActive && <Tag color="default">Inactive</Tag>}
                    {getTrendIcon(goal.performance?.trend || "stable")}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">{goal.description}</Text>
                    <br />
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div>
                        <Text strong>
                          Progress: {goal.currentValue} / {goal.target}{" "}
                          {goal.unit}
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <div
                            style={{
                              width: "100%",
                              height: 8,
                              backgroundColor: "#f0f0f0",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${getProgressPercentage(goal)}%`,
                                height: "100%",
                                backgroundColor: getCategoryColor(
                                  goal.category
                                ),
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {goal.performance && (
                        <Space size="large">
                          <Text type="secondary">
                            Completion Rate: {goal.performance.completionRate}%
                          </Text>
                          <Text type="secondary">
                            Best Streak: {goal.performance.bestStreak}
                          </Text>
                          <Text type="secondary">
                            Current Streak: {goal.performance.currentStreak}
                          </Text>
                        </Space>
                      )}

                      {goal.milestones && goal.milestones.length > 0 && (
                        <div>
                          <Text strong>Milestones:</Text>
                          <div style={{ marginTop: 4 }}>
                            {goal.milestones.slice(0, 3).map((milestone) => (
                              <Tag
                                key={milestone.id}
                                color={
                                  milestone.isCompleted ? "green" : "default"
                                }
                                icon={
                                  milestone.isCompleted ? (
                                    <CheckCircleOutlined />
                                  ) : null
                                }
                                style={{
                                  marginBottom: 4,
                                  cursor: milestone.isCompleted
                                    ? "default"
                                    : "pointer",
                                }}
                                onClick={() =>
                                  !milestone.isCompleted &&
                                  handleCompleteMilestone(goal.id, milestone.id)
                                }
                              >
                                {milestone.name}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {goal.motivationalMessage && (
                        <Text
                          italic
                          style={{ color: getCategoryColor(goal.category) }}
                        >
                          💡 {goal.motivationalMessage}
                        </Text>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: "No custom goals yet. Add your first goal!" }}
        />
      </Card>

      {/* Enhanced Add/Edit Goal Modal */}
      <Modal
        title={editingGoal ? "Edit Smart Goal" : "Create New Smart Goal"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Goal Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter a goal name" },
                ]}
              >
                <Input placeholder="e.g., Weekly Cardio Sessions" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select placeholder="Select category">
                  <Option value="workout">Workout</Option>
                  <Option value="calories">Calories</Option>
                  <Option value="duration">Duration</Option>
                  <Option value="weight">Weight</Option>
                  <Option value="strength">Strength</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Describe what this goal is about..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Goal Type"
                name="type"
                rules={[{ required: true, message: "Please select a type" }]}
              >
                <Select placeholder="Select type">
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="streak">Streak</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Target"
                name="target"
                rules={[{ required: true, message: "Please enter a target" }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Target value"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Unit"
                name="unit"
                rules={[{ required: true, message: "Please enter a unit" }]}
              >
                <Input placeholder="e.g., workouts, calories, minutes" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Difficulty"
                name="difficulty"
                rules={[
                  { required: true, message: "Please select difficulty" },
                ]}
              >
                <Select placeholder="Select difficulty">
                  <Option value="beginner">Beginner</Option>
                  <Option value="intermediate">Intermediate</Option>
                  <Option value="advanced">Advanced</Option>
                  <Option value="expert">Expert</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: "Please select priority" }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Adaptive Target"
                name="adaptiveTarget"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Tags (comma-separated)" name="tags">
            <Input placeholder="e.g., fitness, cardio, health" />
          </Form.Item>

          <Form.Item label="Motivational Message" name="motivationalMessage">
            <Input placeholder="A personal message to keep you motivated" />
          </Form.Item>

          {/* Reminder Settings */}
          <div
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: "#fafafa",
              borderRadius: 6,
            }}
          >
            <h4>Reminder Settings</h4>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Enable Reminders"
                  name="reminderEnabled"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Frequency" name="reminderFrequency">
                  <Select placeholder="Select frequency">
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="custom">Custom</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Time" name="reminderTime">
                  <Input placeholder="HH:MM (e.g., 18:00)" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Reminder Message" name="reminderMessage">
              <Input placeholder="Custom reminder message" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        title="Your Achievements"
        open={achievementsVisible}
        onCancel={() => setAchievementsVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ maxHeight: 500, overflowY: "auto" }}>
          <Row gutter={[16, 16]}>
            {goals?.achievements?.map((achievement) => (
              <Col xs={24} md={12} key={achievement.id}>
                <Card
                  size="small"
                  style={{
                    opacity: achievement.isUnlocked ? 1 : 0.5,
                    border: achievement.isUnlocked
                      ? "2px solid #52c41a"
                      : "1px solid #d9d9d9",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ fontSize: "2rem" }}>{achievement.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold" }}>
                        {achievement.name}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#666" }}>
                        {achievement.description}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Tag
                          color={achievement.isUnlocked ? "green" : "default"}
                        >
                          {achievement.points} points
                        </Tag>
                        <Tag color="blue">{achievement.rarity}</Tag>
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <Text
                            type="secondary"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Unlocked:{" "}
                            {achievement.unlockedAt.toLocaleDateString()}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>

      {/* Goal Suggestions Modal */}
      <Modal
        title="Suggested Goals"
        open={suggestionsVisible}
        onCancel={() => setSuggestionsVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={goalSuggestions}
          renderItem={(suggestion) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleAddSuggestedGoal(suggestion)}
                >
                  Add Goal
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: `${getCategoryColor(
                        suggestion.category || "custom"
                      )}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getCategoryColor(suggestion.category || "custom"),
                      fontSize: "18px",
                    }}
                  >
                    {getCategoryIcon(suggestion.category || "custom")}
                  </div>
                }
                title={suggestion.name}
                description={
                  <div>
                    <div>{suggestion.description}</div>
                    <div style={{ marginTop: 4 }}>
                      <Tag
                        color={getDifficultyColor(
                          suggestion.difficulty || "beginner"
                        )}
                      >
                        {suggestion.difficulty}
                      </Tag>
                      <Tag
                        color={getPriorityColor(
                          suggestion.priority || "medium"
                        )}
                      >
                        {suggestion.priority} priority
                      </Tag>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: "No suggestions available at the moment." }}
        />
      </Modal>
    </div>
  );
};

export default GoalsManager;
