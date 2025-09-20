import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFitnessData, type FitnessData, getBMICategory } from '../services/fitnessService';
import './WorkoutRecommendations.css';

type ChatMsg = {
  id: string;
  role: 'bot' | 'user' | 'system';
  text: string;
};

type Goal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility';
type Experience = 'beginner' | 'intermediate' | 'advanced';
type Equipment = 'none' | 'home_basic' | 'gym_full';

type ChatState = {
  goal?: Goal;
  experience?: Experience;
  equipment?: Equipment;
  daysPerWeek?: number;
  constraints?: string;
};

const QUICK_REPLIES: Record<string, { label: string; value: string }[]> = {
  goal: [
    { label: 'Lose weight', value: 'weight_loss' },
    { label: 'Build muscle', value: 'muscle_gain' },
    { label: 'Endurance', value: 'endurance' },
    { label: 'Flexibility', value: 'flexibility' },
  ],
  experience: [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ],
  equipment: [
    { label: 'No equipment', value: 'none' },
    { label: 'Home basics', value: 'home_basic' },
    { label: 'Gym access', value: 'gym_full' },
  ],
  days: [
    { label: '2 days', value: '2' },
    { label: '3 days', value: '3' },
    { label: '4 days', value: '4' },
    { label: '5 days', value: '5' },
  ],
};

type QuestionKey = keyof ChatState;
type QuestionReadonly = Readonly<{
  key: QuestionKey;
  text: string;
}>;

// Type that enforces all ChatState keys are present exactly once
type ValidateQuestions<T extends readonly QuestionReadonly[]> = {
  [K in QuestionKey]: T extends readonly [...infer U, { key: K }, ...unknown[]]
    ? U extends QuestionReadonly[]
      ? unknown
      : `Missing question for key: ${K}`
    : `Missing question for key: ${K}`;
}[QuestionKey] extends unknown
  ? T
  : never;

// Helper function for development-time validation
function validateQuestions<T extends readonly QuestionReadonly[]>(
  questions: T & ValidateQuestions<T>
): T {
  if (process.env.NODE_ENV !== 'production') {
    const requiredKeys = new Set<QuestionKey>(['goal', 'experience', 'equipment', 'daysPerWeek', 'constraints']);
    const questionKeys = new Set(questions.map(q => q.key));
    
    // Check for missing keys
    const missingKeys = [...requiredKeys].filter(key => !questionKeys.has(key));
    if (missingKeys.length > 0) {
      console.error(`Missing questions for keys: ${missingKeys.join(', ')}`);
    }
    
    // Check for extra keys
    const extraKeys = [...questionKeys].filter(key => !requiredKeys.has(key));
    if (extraKeys.length > 0) {
      console.error(`Extra questions found for keys: ${extraKeys.join(', ')}`);
    }
    
    // Check for duplicates
    const keyCounts = questions.reduce((acc, { key }) => {
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<QuestionKey, number>);
    const duplicateKeys = Object.entries(keyCounts)
      .filter(([, count]) => count > 1)
      .map(([key]) => key);
    
    if (duplicateKeys.length > 0) {
      console.error(`Duplicate questions found for keys: ${duplicateKeys.join(', ')}`);
    }
  }
  return questions;
}

const QUESTIONS = validateQuestions([
  { key: 'goal' as const, text: 'Choose your primary goal.' },
  { key: 'experience' as const, text: 'What is your experience level?' },
  { key: 'equipment' as const, text: 'What equipment do you have access to?' },
  { key: 'daysPerWeek' as const, text: 'How many days per week can you train?' },
  { key: 'constraints' as const, text: 'Any injuries or constraints I should know about? (optional)' },
] as const);

const getQuestionForStep = (s: number): QuestionReadonly | null => {
  return s < QUESTIONS.length ? QUESTIONS[s] : null;
};

const WorkoutRecommendations: React.FC = () => {
  const navigate = useNavigate();

  const [fitness, setFitness] = useState<FitnessData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [state, setState] = useState<ChatState>({});
  const [plan, setPlan] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const data = await getFitnessData();
        setFitness(data);
        const intro: ChatMsg[] = [];
        if (data) {
          const bmiCat = data.bmi ? getBMICategory(data.bmi) : undefined;
          intro.push({
            id: 'sys-1',
            role: 'system',
            text: `Loaded your profile: ${data.age ? `${data.age}y` : ''}${data.height ? `, ${data.height} cm` : ''}${data.weight ? `, ${data.weight} kg` : ''}${data.bmi ? `, BMI ${data.bmi}` : ''}${bmiCat ? ` (${bmiCat})` : ''}.`,
          });
        }
        intro.push({ id: 'bot-hello', role: 'bot', text: 'Hi! I can recommend a workout plan tailored to you. What is your primary goal?' });
        setMessages(intro);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Failed to load your profile');
        setMessages([{ id: 'bot-hello', role: 'bot', text: 'Hi! I can recommend a workout plan tailored to you. What is your primary goal?' }]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const currentQuestion = useMemo(() => getQuestionForStep(step), [step]);

  const append = (msg: Omit<ChatMsg, 'id'>) => {
    setMessages(prev => ([...prev, { id: `${Date.now()}-${Math.random()}`, ...msg }]));
  };

  const handleQuick = (value: string) => {
    if (!currentQuestion) return;
    handleAnswer(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleAnswer(input.trim());
    setInput('');
  };

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return;
    // Echo user
    append({ role: 'user', text: formatForDisplay(currentQuestion.key, value) });

    // Update state
    setState(prev => {
      const next = { ...prev } as ChatState;
      switch (currentQuestion.key) {
        case 'goal': next.goal = value as Goal; break;
        case 'experience': next.experience = value as Experience; break;
        case 'equipment': next.equipment = value as Equipment; break;
        case 'daysPerWeek': next.daysPerWeek = Math.max(1, Math.min(7, parseInt(value, 10) || 3)); break;
        case 'constraints': next.constraints = value; break;
      }
      return next;
    });

    // Ask next or finalize
    if (step < 4) {
      const nextStep = step + 1;
      setStep(nextStep);
      setTimeout(() => {
        const q = getQuestionForStep(nextStep);
        append({ role: 'bot', text: q?.text || '' });
      }, 250);
    } else {
      // Generate plan
      setTimeout(() => finalizePlan(), 350);
    }
  };

  const formatForDisplay = (key: string, value: string) => {
    if (key === 'goal') {
      const map: Record<string, string> = {
        weight_loss: 'Weight loss',
        muscle_gain: 'Build muscle',
        endurance: 'Endurance',
        flexibility: 'Flexibility',
      };
      return map[value] || value;
    }
    if (key === 'experience') return value.charAt(0).toUpperCase() + value.slice(1);
    if (key === 'equipment') {
      const map: Record<string, string> = { none: 'No equipment', home_basic: 'Home basics', gym_full: 'Gym access' };
      return map[value] || value;
    }
    if (key === 'daysPerWeek') return `${value} days/week`;
    return value;
  };

  const finalizePlan = () => {
    const s = { ...state };
    if (!s.daysPerWeek) s.daysPerWeek = 3;
    const summary = buildPlanSummary(s, fitness || undefined);
    setPlan(summary);
    append({ role: 'bot', text: 'Great! Here is a recommended weekly plan based on your inputs:' });
    append({ role: 'bot', text: summary });
  };

  const buildPlanSummary = (s: ChatState, f?: FitnessData | undefined) => {
    const lines: string[] = [];
    const goalLabel = formatForDisplay('goal', s.goal || '');
    const exp = s.experience || 'beginner';
    const equip = formatForDisplay('equipment', s.equipment || 'none');
    const days = s.daysPerWeek || 3;
    const bmiNote = f?.bmi ? `BMI ${f.bmi} (${getBMICategory(f.bmi)})` : undefined;

    lines.push(`Goal: ${goalLabel} | Level: ${exp} | Equip: ${equip} | Days/wk: ${days}${bmiNote ? ` | ${bmiNote}` : ''}`);
    if (s.constraints) lines.push(`Notes: ${s.constraints}`);

    // Build a simple weekly template
    const dayTemplates = getDayTemplates(s);
    lines.push('');
    for (let i = 1; i <= days; i++) {
      const d = dayTemplates[i - 1] || dayTemplates[dayTemplates.length - 1];
      lines.push(`Day ${i}: ${d.title}`);
      d.exercises.forEach(ex => lines.push(`  - ${ex}`));
    }
    lines.push('');
    lines.push('Tip: Warm-up 5–10 min. Progress by small increments weekly.');
    return lines.join('\n');
  };

  const getDayTemplates = (s: ChatState) => {
    const level = s.experience || 'beginner';
    const goal = s.goal || 'weight_loss';
    const equip = s.equipment || 'none';

    const hasWeights = equip === 'home_basic' || equip === 'gym_full';
    const heavy = equip === 'gym_full';

    const strengthBlock = heavy
      ? ['Barbell squats 3x6-8', 'Bench press 3x6-8', 'Deadlift 3x5', 'Row 3x8-10', 'Plank 3x45s']
      : hasWeights
        ? ['Goblet squats 3x8-10', 'DB bench press 3x8-10', 'RDL 3x8-10', 'One-arm row 3x10-12', 'Plank 3x30-45s']
        : ['Bodyweight squats 3x12-15', 'Push-ups 3x8-12', 'Hip hinge 3x12-15', 'Reverse rows 3x8-12', 'Plank 3x30-45s'];

    const cardioBlock = level === 'beginner' ? '20–30 min Zone 2 cardio' : '30–45 min cardio (Intervals optional)';
    const hiitBlock = level === 'beginner' ? '8 x 30s hard / 90s easy' : '10–12 x 30s hard / 60s easy';
    const mobilityBlock = ['Hip flexor stretch', 'Hamstring stretch', 'Thoracic rotations', 'Ankle mobility 2x'];

    if (goal === 'muscle_gain') {
      return [
        { title: 'Upper Strength', exercises: strengthBlock },
        { title: 'Lower Strength', exercises: strengthBlock },
        { title: 'Full-body Hypertrophy', exercises: strengthBlock.concat(['Accessory: curls/raises 2x12-15']) },
        { title: 'Cardio + Mobility', exercises: [cardioBlock, ...mobilityBlock] },
        { title: 'Optional: HIIT + Core', exercises: [hiitBlock, 'Core circuit 10-12 min'] },
      ];
    }
    if (goal === 'endurance') {
      return [
        { title: 'Easy cardio', exercises: [cardioBlock] },
        { title: 'Strength maintenance', exercises: strengthBlock.slice(0, 3) },
        { title: 'Intervals', exercises: [hiitBlock] },
        { title: 'Long steady', exercises: ['45–60+ min Zone 2 cardio'] },
        { title: 'Mobility + Core', exercises: mobilityBlock.concat(['Core 10–12 min']) },
      ];
    }
    if (goal === 'flexibility') {
      return [
        { title: 'Mobility flow A', exercises: mobilityBlock },
        { title: 'Mobility flow B', exercises: mobilityBlock },
        { title: 'Light cardio + mobility', exercises: ['15–25 min light cardio', ...mobilityBlock] },
        { title: 'Core + posture', exercises: ['Core 10–12 min', 'Scapular work 2x12-15'] },
        { title: 'Yoga/Stretch session', exercises: ['30–45 min guided yoga or stretching'] },
      ];
    }
    // default weight loss
    return [
      { title: 'Full-body strength', exercises: strengthBlock },
      { title: 'Zone 2 cardio', exercises: [cardioBlock] },
      { title: 'HIIT + Core', exercises: [hiitBlock, 'Core circuit 10-12 min'] },
      { title: 'Strength + Mobility', exercises: strengthBlock.slice(0, 3).concat(mobilityBlock) },
      { title: 'Long steady cardio', exercises: ['40–60 min steady cardio'] },
    ];
  };

  const handleStartOver = () => {
    setState({});
    setStep(0);
    setPlan(null);
    setMessages(prev => prev.filter(m => m.role === 'system'));
    setTimeout(() => append({ role: 'bot', text: 'What is your primary goal?' }), 100);
  };

  const handleToPlanner = () => {
    navigate('/workout-planner', { state: { recommendedPlan: plan } });
  };

  const renderQuickReplies = () => {
    if (!currentQuestion || plan) return null;
    const key = currentQuestion.key;
    if (key === 'constraints') return null; // free text
    const choices = key === 'daysPerWeek'
      ? QUICK_REPLIES.days
      : key === 'goal'
        ? QUICK_REPLIES.goal
        : key === 'experience'
          ? QUICK_REPLIES.experience
          : key === 'equipment'
            ? QUICK_REPLIES.equipment
            : undefined;
    if (!choices) return null;
    return (
      <div className="quick-replies">
        {choices.map((c: { label: string; value: string }) => (
          <button key={c.value} className="chip" onClick={() => handleQuick(c.value)}>{c.label}</button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="wrp-page">
        <div className="wrp-hero">
          <h1 className="wrp-title">Workout Recommendations</h1>
          <p className="wrp-sub">Personalized plans based on your goals.</p>
        </div>
        <div className="wrp-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrp-page">
      <div className="wrp-hero">
        <h1 className="wrp-title">Workout Recommendations</h1>
        <p className="wrp-sub">Chat with your coach to build a plan.</p>
        {error && <p className="wrp-error">{error}</p>}
      </div>

      <div className="wrp-chat wrp-card">
        <div className="messages" ref={listRef}>
          {messages.map(m => (
            <div key={m.id} className={`msg ${m.role}`}>
              <div className="bubble">
                {m.text.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
              </div>
            </div>
          ))}
          {plan && (
            <div className="actions">
              <button className="btn primary" onClick={handleToPlanner}>Add to Planner</button>
              <button className="btn" onClick={handleStartOver}>Start Over</button>
            </div>
          )}
        </div>

        {!plan && (
          <>
            {renderQuickReplies()}
            <form className="input-bar" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder={currentQuestion?.text || 'Type a message'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!currentQuestion}
              />
              <button type="submit" className="send" disabled={!currentQuestion || !input.trim()}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutRecommendations;
