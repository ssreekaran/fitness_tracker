import React, { useEffect, useMemo, useState } from "react";
import { getFitnessData, type FitnessData } from "../services/fitnessService";
import NutritionChatbot from "../components/NutritionChatbot";
import { UserProfile } from "../services/chatbotService";
import "./DietRecommendations.css";

const DietRecommendations: React.FC = () => {
  const [fitness, setFitness] = useState<FitnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert fitness data to user profile for AI chatbot
  const userProfile: UserProfile = useMemo(() => {
    if (!fitness) return {};

    return {
      age: fitness.age,
      height: fitness.height,
      weight: fitness.weight,
      gender: fitness.gender,
      bmi: fitness.bmi,
      // Only include data that actually exists in the database
      // goal and dietType are not stored in fitness data, so we omit them
      // The AI will ask the user about these preferences during conversation
    };
  }, [fitness]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const data = await getFitnessData();
        setFitness(data);
      } catch (e) {
        console.error(e);
        setError(
          e instanceof Error ? e.message : "Failed to load your profile"
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="drp-page">
        <div className="drp-hero">
          <h1 className="drp-title">AI Nutrition Coach</h1>
          <p className="drp-sub">
            Get personalized diet recommendations powered by AI.
          </p>
        </div>
        <div
          className="drp-card"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <div className="spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drp-page">
      <div className="drp-hero">
        <h1 className="drp-title">AI Nutrition Coach</h1>
        <p className="drp-sub">
          Chat with your AI-powered nutrition assistant for personalized diet
          advice.
        </p>
        {error && <p className="drp-error">{error}</p>}

        <div className="disclaimer">
          <div className="disclaimer-icon">⚠️</div>
          <div className="disclaimer-content">
            <strong>Important Disclaimer:</strong> This AI chatbot provides
            general nutrition information and suggestions only. It is not a
            substitute for professional medical advice. For serious health
            concerns, dietary restrictions, or medical conditions, please
            consult with a registered dietitian, nutritionist, or healthcare
            provider.
          </div>
        </div>
      </div>

      <NutritionChatbot
        userProfile={userProfile}
        initialMessage={
          fitness && fitness.age && fitness.height && fitness.weight
            ? `Hi! I'm your AI nutrition coach. I can see your profile (${
                fitness.age
              }y, ${fitness.height}cm, ${fitness.weight}kg${
                fitness.bmi ? `, BMI ${fitness.bmi}` : ""
              }) and I'm ready to help you create a personalized diet plan. I'll ask about your goals and dietary preferences as we chat. What would you like to know about nutrition or meal planning?`
            : "Hi! I'm your AI nutrition coach. I can provide general nutrition guidance and meal suggestions. To get more personalized advice, consider updating your profile with your age, height, and weight. I'll also ask about your goals and dietary preferences as we chat. How can I help you with your diet and nutrition goals today?"
        }
      />
    </div>
  );
};

export default DietRecommendations;
