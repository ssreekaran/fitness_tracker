import React, { useEffect, useMemo, useState } from "react";
import { getFitnessData, type FitnessData } from "../services/fitnessService";
import FitnessChatbot from "../components/chatbots/FitnessChatbot";
import { WorkoutUserProfile } from "../services/workoutChatbotService";
import "./WorkoutRecommendations.css";

const WorkoutRecommendations: React.FC = () => {
  const [fitness, setFitness] = useState<FitnessData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Convert fitness data to user profile for AI chatbot
  const userProfile: WorkoutUserProfile = useMemo(() => {
    if (!fitness) return {};

    return {
      age: fitness.age,
      height: fitness.height,
      weight: fitness.weight,
      gender: fitness.gender,
      bmi: fitness.bmi,
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
      <div className="wrp-page">
        <div className="wrp-hero">
          <h1 className="wrp-title">AI Fitness Coach</h1>
          <p className="wrp-sub">
            Get personalized workout recommendations powered by AI.
          </p>
        </div>
        <div
          className="wrp-card"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <div className="spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrp-page">
      <div className="wrp-hero">
        <h1 className="wrp-title">AI Fitness Coach</h1>
        <p className="wrp-sub">
          Chat with your AI-powered fitness coach for personalized workout
          plans.
        </p>
        {error && <p className="wrp-error">{error}</p>}

        <div className="disclaimer">
          <div className="disclaimer-icon">⚠️</div>
          <div className="disclaimer-content">
            <strong>Important Disclaimer:</strong> This AI fitness coach
            provides general workout guidance and suggestions only. It is not a
            substitute for professional fitness training or medical advice. For
            injuries, medical conditions, or personalized training programs,
            please consult with a certified personal trainer or healthcare
            provider.
          </div>
        </div>
      </div>

      <FitnessChatbot
        userProfile={userProfile}
        initialMessage={
          fitness && fitness.age && fitness.height && fitness.weight
            ? `Hey! I'm your AI fitness coach! 💪 I can see your profile (${
                fitness.age
              }y, ${fitness.height}cm, ${fitness.weight}kg${
                fitness.bmi ? `, BMI ${fitness.bmi}` : ""
              }) and I'm pumped to help you create an awesome workout plan! What's your main fitness goal right now?`
            : "Hey! I'm your AI fitness coach! 💪 I can provide workout guidance and training plans. To get more personalized recommendations, consider updating your profile with your age, height, and weight. Let's get you moving and feeling amazing! What's your fitness goal?"
        }
      />
    </div>
  );
};

export default WorkoutRecommendations;
