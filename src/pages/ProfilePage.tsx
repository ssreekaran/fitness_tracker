import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { auth } from "../firebase";
import { getFitnessData, getBMICategory } from "../services/fitnessService";
import { FitnessData } from "../services/fitnessService";
import {
  getActivitySummary,
  ActivitySummary,
} from "../services/workoutService";
import {
  Card,
  Typography,
  Space,
  Button,
  Avatar,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  TrophyOutlined,
  FireOutlined,
  HeartOutlined,
  CalendarOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { User } from "firebase/auth";
import "./ProfilePage.css";

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [activityData, setActivityData] = useState<ActivitySummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activityError, setActivityError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getFitnessData();
        if (isMounted) {
          setFitnessData(data);
        }
      } catch (err) {
        console.error("Error loading fitness data:", err);
        if (isMounted) {
          setError("Failed to load fitness data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadActivityData = async () => {
      try {
        setActivityLoading(true);
        setActivityError("");
        const activity = await getActivitySummary();
        if (isMounted) {
          setActivityData(activity);
        }
      } catch (err) {
        console.error("Error loading activity data:", err);
        if (isMounted) {
          setActivityError("Failed to load activity data");
        }
      } finally {
        if (isMounted) {
          setActivityLoading(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/", { replace: true });
      } else {
        setUser(firebaseUser);
        loadData();
        loadActivityData();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      // First delete user data
      // Then delete the user account
      await deleteUser(user);
      setSuccess("Your account has been deleted successfully.");
      setTimeout(() => navigate("/"), 2000);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/requires-recent-login") {
        setError("Please log out and log in again to delete your account.");
      } else {
        setError(err.message || "Failed to delete account.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const getBMIColor = (bmi: number | null | undefined) => {
    if (!bmi) return "#ccc";
    if (bmi < 18.5) return "#87d068";
    if (bmi < 25) return "#2ecc71";
    if (bmi < 30) return "#f1c40f";
    return "#e74c3c";
  };

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={user.photoURL || undefined}
          />
          <div className="profile-name">
            <Title level={3} className="mb-0">
              {user.displayName || "User"}
            </Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </div>
        <Button
          type="primary"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="profile-content">
        <Row gutter={[24, 24]}>
          {/* Account Information */}
          <Col xs={24} md={12}>
            <Card
              className="profile-card"
              title={
                <Space>
                  <UserOutlined />
                  <span>Account Information</span>
                </Space>
              }
              extra={
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => navigate("/settings")}
                >
                  Edit
                </Button>
              }
            >
              <div className="info-section">
                <div className="info-item">
                  <Text type="secondary" className="info-label">
                    Name
                  </Text>
                  <Text strong className="info-value">
                    {user.displayName || "Not set"}
                  </Text>
                </div>
                <div className="info-item">
                  <Text type="secondary" className="info-label">
                    Email
                  </Text>
                  <Text strong className="info-value">
                    {user.email}
                  </Text>
                </div>
                <div className="info-item">
                  <Text type="secondary" className="info-label">
                    Account Created
                  </Text>
                  <Text strong className="info-value">
                    {user.metadata?.creationTime
                      ? new Date(
                          user.metadata.creationTime
                        ).toLocaleDateString()
                      : "N/A"}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Fitness Stats */}
          <Col xs={24} md={12}>
            <Card
              className="profile-card"
              title={
                <Space>
                  <TrophyOutlined />
                  <span>Fitness Stats</span>
                </Space>
              }
              loading={loading}
            >
              {fitnessData ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <Statistic
                      title="BMI"
                      value={fitnessData.bmi?.toFixed(1) || "--"}
                      suffix={
                        fitnessData.bmi ? getBMICategory(fitnessData.bmi) : ""
                      }
                    />
                    <Progress
                      percent={
                        fitnessData.bmi
                          ? Math.min(100, (fitnessData.bmi / 40) * 100)
                          : 0
                      }
                      showInfo={false}
                      strokeColor={getBMIColor(fitnessData.bmi)}
                    />
                  </div>

                  <div className="stat-card">
                    <Statistic
                      title="Weight"
                      value={fitnessData.weight}
                      suffix="kg"
                    />
                    <Text type="secondary">
                      {(fitnessData.weight * 2.20462).toFixed(1)} lbs
                    </Text>
                  </div>

                  <div className="stat-card">
                    <Statistic
                      title="Height"
                      value={fitnessData.height}
                      suffix="cm"
                    />
                    <Text type="secondary">
                      {(fitnessData.height / 2.54).toFixed(1)} in
                    </Text>
                  </div>

                  <div className="stat-card">
                    <Statistic
                      title="Age"
                      value={fitnessData.age}
                      suffix="years"
                    />
                    <Text type="secondary">
                      {fitnessData.gender?.charAt(0).toUpperCase() +
                        fitnessData.gender?.slice(1)}
                    </Text>
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <Text type="secondary">No fitness data available</Text>
                  <Button
                    type="primary"
                    onClick={() => navigate("/personal-fitness")}
                  >
                    Set Up Your Profile
                  </Button>
                </div>
              )}
            </Card>
          </Col>

          {/* Activity Summary */}
          <Col span={24}>
            <Card
              className="profile-card"
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Activity Summary</span>
                </Space>
              }
            >
              {activityError ? (
                <Alert
                  message="Activity data unavailable"
                  description="Unable to load your activity statistics. Please try refreshing the page."
                  type="warning"
                  showIcon
                />
              ) : (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card
                      className="activity-card"
                      hoverable
                      loading={activityLoading}
                    >
                      <div
                        className="activity-icon"
                        style={{ backgroundColor: "#fff2f0" }}
                      >
                        <FireOutlined style={{ color: "#ff4d4f" }} />
                      </div>
                      <div className="activity-content">
                        <Text type="secondary">Workouts This Week</Text>
                        <Title level={3} className="mb-0">
                          {activityLoading ? (
                            <div
                              className="loading-skeleton"
                              style={{
                                width: "60px",
                                height: "32px",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "4px",
                              }}
                            />
                          ) : activityData ? (
                            `${activityData.workoutsThisWeek.completed}/${activityData.workoutsThisWeek.target}`
                          ) : (
                            <span style={{ opacity: 0.5 }}>
                              0/5{" "}
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                (Demo)
                              </Text>
                            </span>
                          )}
                        </Title>
                        {!activityLoading && (
                          <Progress
                            percent={
                              activityData?.workoutsThisWeek.percentage || 0
                            }
                            showInfo={false}
                            strokeColor="#ff4d4f"
                          />
                        )}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card
                      className="activity-card"
                      hoverable
                      loading={activityLoading}
                    >
                      <div
                        className="activity-icon"
                        style={{ backgroundColor: "#f6ffed" }}
                      >
                        <HeartOutlined style={{ color: "#52c41a" }} />
                      </div>
                      <div className="activity-content">
                        <Text type="secondary">Current Streak</Text>
                        <Title level={3} className="mb-0">
                          {activityLoading ? (
                            <div
                              className="loading-skeleton"
                              style={{
                                width: "80px",
                                height: "32px",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "4px",
                              }}
                            />
                          ) : activityData ? (
                            `${activityData.currentStreak.days} days`
                          ) : (
                            <span style={{ opacity: 0.5 }}>
                              0 days{" "}
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                (Demo)
                              </Text>
                            </span>
                          )}
                        </Title>
                        <Text type="secondary">
                          {activityLoading ? (
                            <div
                              className="loading-skeleton"
                              style={{
                                width: "100px",
                                height: "16px",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "4px",
                                marginTop: "4px",
                              }}
                            />
                          ) : activityData ? (
                            `Best: ${activityData.currentStreak.bestStreak} days`
                          ) : (
                            <span style={{ opacity: 0.5 }}>Best: 0 days</span>
                          )}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card
                      className="activity-card"
                      hoverable
                      loading={activityLoading}
                    >
                      <div
                        className="activity-icon"
                        style={{ backgroundColor: "#e6f7ff" }}
                      >
                        <TrophyOutlined style={{ color: "#1890ff" }} />
                      </div>
                      <div className="activity-content">
                        <Text type="secondary">Weekly Goals Met</Text>
                        <Title level={3} className="mb-0">
                          {activityLoading ? (
                            <div
                              className="loading-skeleton"
                              style={{
                                width: "60px",
                                height: "32px",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "4px",
                              }}
                            />
                          ) : activityData ? (
                            `${activityData.goalsAchieved.completed}/${activityData.goalsAchieved.total}`
                          ) : (
                            <span style={{ opacity: 0.5 }}>
                              0/4{" "}
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                (Demo)
                              </Text>
                            </span>
                          )}
                        </Title>
                        {!activityLoading && (
                          <Progress
                            percent={
                              activityData?.goalsAchieved.percentage || 0
                            }
                            showInfo={false}
                          />
                        )}
                      </div>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Danger Zone */}
      <Card
        className="danger-zone"
        title={
          <Space>
            <DeleteOutlined style={{ color: "#ff4d4f" }} />
            <span>Danger Zone</span>
          </Space>
        }
      >
        <div className="danger-content">
          <div>
            <Text strong>Delete Account</Text>
            <Text type="secondary" style={{ display: "block" }}>
              Permanently delete your account and all associated data
            </Text>
          </div>
          <Button
            type="primary"
            danger
            onClick={handleDeleteAccount}
            loading={deleting}
            disabled={deleting}
            icon={<DeleteOutlined />}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
        {error && (
          <Alert message={error} type="error" showIcon className="mt-3" />
        )}
        {success && (
          <Alert message={success} type="success" showIcon className="mt-3" />
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
