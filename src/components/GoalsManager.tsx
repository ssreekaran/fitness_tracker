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
} from "@ant-design/icons";
import {
  getUserGoals,
  updateUserGoals,
  addCustomGoal,
  updateCustomGoal,
  deleteCustomGoal,
  UserGoals,
  CustomGoal,
} from "../services/goalsService";

const { Text } = Typography;
const { Option } = Select;

interface GoalsManagerProps {
  onGoalsUpdate?: () => void;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ onGoalsUpdate }) => {
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<CustomGoal | null>(null);
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
    });
    setModalVisible(true);
  };

  const handleEditGoal = (goal: CustomGoal) => {
    setEditingGoal(goal);
    form.setFieldsValue(goal);
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingGoal) {
        await updateCustomGoal(editingGoal.id, values);
        message.success("Goal updated successfully");
      } else {
        await addCustomGoal(values);
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

  const handleToggleGoal = async (goal: CustomGoal) => {
    try {
      await updateCustomGoal(goal.id, { isActive: !goal.isActive });
      message.success(`Goal ${goal.isActive ? "disabled" : "enabled"}`);
      await loadGoals();
      onGoalsUpdate?.();
    } catch (error) {
      message.error("Failed to toggle goal");
      console.error("Error toggling goal:", error);
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
      default:
        return "#722ed1";
    }
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

      {/* Custom Goals */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>Custom Goals</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddGoal}
          >
            Add Goal
          </Button>
        }
      >
        <List
          dataSource={goals?.customGoals || []}
          renderItem={(goal) => (
            <List.Item
              actions={[
                <Switch
                  checked={goal.isActive}
                  onChange={() => handleToggleGoal(goal)}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />,
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
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: `${getCategoryColor(goal.category)}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getCategoryColor(goal.category),
                      fontSize: "18px",
                    }}
                  >
                    {getCategoryIcon(goal.category)}
                  </div>
                }
                title={
                  <Space>
                    <span>{goal.name}</span>
                    <Tag color={getCategoryColor(goal.category)}>
                      {goal.type}
                    </Tag>
                    {!goal.isActive && <Tag color="default">Inactive</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">{goal.description}</Text>
                    <br />
                    <Text strong>
                      Target: {goal.target} {goal.unit} | Current:{" "}
                      {goal.currentValue} {goal.unit}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: "No custom goals yet. Add your first goal!" }}
        />
      </Card>

      {/* Add/Edit Goal Modal */}
      <Modal
        title={editingGoal ? "Edit Goal" : "Add New Goal"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={600}
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
            <Col xs={24} md={8}>
              <Form.Item
                label="Goal Type"
                name="type"
                rules={[{ required: true, message: "Please select a type" }]}
              >
                <Select placeholder="Select type">
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="streak">Streak</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
              <Form.Item
                label="Unit"
                name="unit"
                rules={[{ required: true, message: "Please enter a unit" }]}
              >
                <Input placeholder="e.g., workouts, calories, minutes" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GoalsManager;
