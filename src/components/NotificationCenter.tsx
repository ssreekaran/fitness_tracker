/**
 * Notification Center Component
 *
 * Displays achievement unlocks, goal completions, and other notifications
 * with beautiful animations and user interactions.
 */

import React from "react";
import { Card, Button, Space, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import {
  useNotifications,
  NotificationConfig,
} from "../services/notificationService";
import "./NotificationCenter.css";

const { Text } = Typography;

interface NotificationItemProps {
  notification: NotificationConfig;
  onRemove: (notification: NotificationConfig) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
}) => {
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "achievement":
        return {
          borderLeft: "4px solid #52c41a",
          background: "linear-gradient(135deg, #f6ffed, #ffffff)",
        };
      case "goal":
        return {
          borderLeft: "4px solid #1890ff",
          background: "linear-gradient(135deg, #f0f8ff, #ffffff)",
        };
      case "milestone":
        return {
          borderLeft: "4px solid #faad14",
          background: "linear-gradient(135deg, #fffbe6, #ffffff)",
        };
      case "celebration":
        return {
          borderLeft: "4px solid #722ed1",
          background: "linear-gradient(135deg, #f9f0ff, #ffffff)",
        };
      case "reminder":
        return {
          borderLeft: "4px solid #fa8c16",
          background: "linear-gradient(135deg, #fff7e6, #ffffff)",
        };
      default:
        return {
          borderLeft: "4px solid #d9d9d9",
          background: "#ffffff",
        };
    }
  };

  return (
    <Card
      className={`notification-item notification-${notification.type}`}
      style={getNotificationStyle(notification.type)}
      size="small"
      actions={[
        notification.action && (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              notification.action!.callback();
              onRemove(notification);
            }}
          >
            {notification.action.label}
          </Button>
        ),
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={() => onRemove(notification)}
        />,
      ].filter(Boolean)}
    >
      <div className="notification-content">
        <div className="notification-header">
          {notification.icon && (
            <span className="notification-icon">{notification.icon}</span>
          )}
          <Text strong className="notification-title">
            {notification.title}
          </Text>
        </div>
        <Text className="notification-message">{notification.message}</Text>
      </div>
    </Card>
  );
};

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification, clearAll } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <Space>
          <Text strong>Notifications ({notifications.length})</Text>
          {notifications.length > 1 && (
            <Button size="small" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </Space>
      </div>

      <div className="notification-list">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={`${notification.type}-${index}`}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;
