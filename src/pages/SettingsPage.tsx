/**
 * SettingsPage Component
 *
 * A comprehensive settings page that provides users with access to:
 * - Fitness goals management and configuration
 * - User preferences and account settings
 * - Application configuration options
 *
 * Features:
 * - Tabbed interface for organized settings sections
 * - Integration with GoalsManager component
 * - Navigation breadcrumbs with back button
 * - Responsive design with consistent styling
 * - Future extensibility for additional settings categories
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Space, Button, Tabs } from "antd";
import {
  SettingOutlined,
  UserOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import GoalsManager from "../components/fitness/GoalsManager";
import "./SettingsPage.css";

const { Title } = Typography;
const { TabPane } = Tabs;

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handle goals update callback
   * Called when goals are successfully updated in the GoalsManager component
   */
  const handleGoalsUpdate = () => {
    // Goals updated successfully - could show notification or refresh data
    console.log("Goals updated successfully");
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-title">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Back
          </Button>
          <Space>
            <SettingOutlined />
            <Title level={2} className="mb-0">
              Settings
            </Title>
          </Space>
        </div>
      </div>

      <div className="settings-content">
        <Tabs defaultActiveKey="goals" size="large">
          <TabPane
            tab={
              <Space>
                <TrophyOutlined />
                <span>Goals & Targets</span>
              </Space>
            }
            key="goals"
          >
            <GoalsManager onGoalsUpdate={handleGoalsUpdate} />
          </TabPane>

          <TabPane
            tab={
              <Space>
                <UserOutlined />
                <span>Account</span>
              </Space>
            }
            key="account"
          >
            <Card>
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Title level={4}>Account Settings</Title>
                <p>Account management features coming soon...</p>
                <Button type="primary" onClick={() => navigate("/profile")}>
                  Go to Profile
                </Button>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
