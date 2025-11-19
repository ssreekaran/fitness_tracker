import React, { useState, useRef, useEffect } from "react";
import {
  chatbotService,
  ChatMessage,
  UserProfile,
} from "../../services/chatbotService";
import { getBMICategory } from "../../services/fitnessService";
import "./NutritionChatbot.css";

interface NutritionChatbotProps {
  userProfile?: UserProfile;
  onClose?: () => void;
  initialMessage?: string;
}

const NutritionChatbot: React.FC<NutritionChatbotProps> = ({
  userProfile,
  onClose,
  initialMessage = "Hi! I'm your AI nutrition coach. I can see your profile and I'm ready to help you create a personalized diet plan. I'll ask about your goals and dietary preferences as we chat. What would you like to know about nutrition or meal planning?",
}) => {
  // Storage key for conversation persistence
  const STORAGE_KEY = "nutrition_chat_history";

  // Load conversation history from localStorage
  const loadConversationHistory = (): ChatMessage[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: ChatMessage & { timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.warn("Error loading conversation history:", error);
    }

    // Return initial message if no history
    return [
      {
        id: "1",
        role: "assistant",
        content: userProfile
          ? `Hi! I'm your AI nutrition coach. I can see your profile (${
              userProfile.age
            }y, ${userProfile.height}cm, ${userProfile.weight}kg${
              userProfile.bmi ? `, BMI ${userProfile.bmi}` : ""
            }) and I'm ready to help you create a personalized diet plan. I'll ask about your goals and dietary preferences as we chat. What would you like to know about nutrition or meal planning?`
          : initialMessage,
        timestamp: new Date(),
      },
    ];
  };

  // Save conversation history to localStorage
  const saveConversationHistory = (messages: ChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.warn("Error saving conversation history:", error);
    }
  };

  // Debug: Log the user profile data
  React.useEffect(() => {
    console.log("NutritionChatbot received userProfile:", userProfile);
  }, [userProfile]);

  const [messages, setMessages] = useState<ChatMessage[]>(
    loadConversationHistory
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages whenever they change
  useEffect(() => {
    saveConversationHistory(messages);
  }, [messages]);

  // Update initial message when user profile changes
  useEffect(() => {
    if (userProfile && messages.length === 1 && messages[0].id === "1") {
      const updatedMessage = {
        ...messages[0],
        content: `Hi! I'm your AI nutrition coach. I can see your profile (${
          userProfile.age
        }y, ${userProfile.height}cm, ${userProfile.weight}kg${
          userProfile.bmi ? `, BMI ${userProfile.bmi}` : ""
        }) and I'm ready to help you create a personalized diet plan. I'll ask about your goals and dietary preferences as we chat. What would you like to know about nutrition or meal planning?`,
      };
      setMessages([updatedMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]); // Intentionally excluding messages to prevent infinite loop

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Only auto-scroll when shouldAutoScroll is true (new messages)
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setShouldAutoScroll(true);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(
        userMessage.content,
        messages,
        userProfile
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setShouldAutoScroll(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  // Clear conversation history
  const clearConversation = () => {
    const initialMessages = [
      {
        id: "1",
        role: "assistant" as const,
        content: userProfile
          ? `Hi! I'm your AI nutrition coach. I can see your profile (${
              userProfile.age
            }y, ${userProfile.height}cm, ${userProfile.weight}kg${
              userProfile.bmi ? `, BMI ${userProfile.bmi}` : ""
            }) and I'm ready to help you create a personalized diet plan. I'll ask about your goals and dietary preferences as we chat. What would you like to know about nutrition or meal planning?`
          : initialMessage,
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Check if conversation was loaded from history
  const hasConversationHistory = messages.length > 1;

  // Generate personalized quick replies based on user profile
  const quickReplies = React.useMemo(() => {
    const baseReplies = [
      "Create a meal plan for me",
      "How many calories should I eat?",
    ];

    if (userProfile?.bmi && userProfile.bmi > 25) {
      baseReplies.push("Help me lose weight safely");
    } else if (userProfile?.bmi && userProfile.bmi < 18.5) {
      baseReplies.push("How can I gain weight healthily?");
    } else {
      baseReplies.push("What foods help with muscle building?");
    }

    if (userProfile?.weight) {
      baseReplies.push(`Calculate protein needs for ${userProfile.weight}kg`);
    } else {
      baseReplies.push("Suggest high-protein meals");
    }

    // Since dietType isn't stored in the database, always show general options
    baseReplies.push("What are good vegetarian options?");

    return baseReplies;
  }, [userProfile]);

  return (
    <div className="nutrition-chatbot">
      <div className="chatbot-header">
        <div className="header-title">
          <h3>🤖 AI Nutrition Coach</h3>
          {hasConversationHistory && (
            <span
              className="history-indicator"
              title="Conversation history loaded"
            >
              💬
            </span>
          )}
        </div>
        <div className="header-buttons">
          <button
            className="clear-btn"
            onClick={clearConversation}
            aria-label="Clear conversation"
            title="Start new conversation"
          >
            🔄
          </button>
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
      </div>

      <div className="profile-display">
        <div className="profile-header">
          <span className="profile-icon">👤</span>
          <span className="profile-title">Your Profile</span>
        </div>
        {userProfile &&
        Object.keys(userProfile).some(
          (key) => userProfile[key as keyof UserProfile] != null
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
            {userProfile.dietType && (
              <div className="stat">
                <span className="stat-label">Diet:</span>
                <span className="stat-value">{userProfile.dietType}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-empty">
            <p>
              No profile data available. Visit your{" "}
              <a href="/profile">Profile page</a> to add your fitness
              information for personalized recommendations.
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
            placeholder="Ask about nutrition, meal plans, calories..."
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

export default NutritionChatbot;
