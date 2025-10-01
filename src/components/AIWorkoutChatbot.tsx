import React, { useState, useRef, useEffect } from "react";
import {
  workoutChatbotService,
  WorkoutChatMessage,
  WorkoutUserProfile,
} from "../services/workoutChatbotService";
import { getBMICategory } from "../services/fitnessService";
import "./AIWorkoutChatbot.css";

interface AIWorkoutChatbotProps {
  userProfile?: WorkoutUserProfile;
  onClose?: () => void;
  initialMessage?: string;
}

const AIWorkoutChatbot: React.FC<AIWorkoutChatbotProps> = ({
  userProfile,
  onClose,
  initialMessage = "Hey! I'm your AI fitness coach. I can provide workout guidance and training plans based on your profile. Remember, I'm an AI assistant and my advice shouldn't replace professional fitness or medical consultation. Let's get you moving and feeling amazing! What's your fitness goal?",
}) => {
  // Debug: Log the user profile data
  React.useEffect(() => {
    console.log("AIWorkoutChatbot received userProfile:", userProfile);
  }, [userProfile]);

  const [messages, setMessages] = useState<WorkoutChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: WorkoutChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await workoutChatbotService.sendMessage(
        userMessage.content,
        messages,
        userProfile
      );

      const assistantMessage: WorkoutChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: WorkoutChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  // Generate personalized quick replies based on user profile
  const quickReplies = React.useMemo(() => {
    const baseReplies = [
      "Create a workout plan for me",
      "I want to build muscle",
    ];

    if (userProfile?.bmi && userProfile.bmi > 25) {
      baseReplies.push("Help me lose weight with exercise");
    } else if (userProfile?.bmi && userProfile.bmi < 18.5) {
      baseReplies.push("How can I gain weight and muscle?");
    } else {
      baseReplies.push("I want to get stronger");
    }

    baseReplies.push("I'm new to working out");
    baseReplies.push("What equipment do I need?");

    return baseReplies;
  }, [userProfile]);

  return (
    <div className="ai-workout-chatbot">
      <div className="chatbot-header">
        <h3>💪 AI Fitness Coach</h3>
        {onClose && (
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close chat"
          >
            ×
          </button>
        )}
      </div>

      <div className="profile-display">
        <div className="profile-header">
          <span className="profile-icon">🏋️</span>
          <span className="profile-title">Your Fitness Profile</span>
        </div>
        {userProfile &&
        Object.keys(userProfile).some(
          (key) => userProfile[key as keyof WorkoutUserProfile] != null
        ) ? (
          <div className="profile-stats">
            {userProfile.age && (
              <div className="stat">
                <span className="stat-label">Age:</span>
                <span className="stat-value">{userProfile.age} years</span>
              </div>
            )}
            {userProfile.height && userProfile.weight && (
              <div className="stat">
                <span className="stat-label">Stats:</span>
                <span className="stat-value">
                  {userProfile.height}cm, {userProfile.weight}kg
                </span>
              </div>
            )}
            {userProfile.bmi && (
              <div className="stat">
                <span className="stat-label">BMI:</span>
                <span className="stat-value">
                  {userProfile.bmi} ({getBMICategory(userProfile.bmi)})
                </span>
              </div>
            )}
            {userProfile.gender && (
              <div className="stat">
                <span className="stat-label">Gender:</span>
                <span className="stat-value">{userProfile.gender}</span>
              </div>
            )}
            {userProfile.goal && (
              <div className="stat">
                <span className="stat-label">Goal:</span>
                <span className="stat-value">
                  {userProfile.goal.replace("_", " ")}
                </span>
              </div>
            )}
            {userProfile.daysPerWeek && (
              <div className="stat">
                <span className="stat-label">Frequency:</span>
                <span className="stat-value">
                  {userProfile.daysPerWeek} days/week
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-empty">
            <p>
              No fitness profile data available. Visit your{" "}
              <a href="/profile">Profile page</a> to add your information for
              personalized workout recommendations.
            </p>
          </div>
        )}
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="quick-replies">
          <p>Quick questions:</p>
          <div className="quick-reply-buttons">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
                disabled={isLoading}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="input-form" onSubmit={handleSendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about workouts, exercises, training plans..."
            disabled={isLoading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            {isLoading ? "..." : "→"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIWorkoutChatbot;
