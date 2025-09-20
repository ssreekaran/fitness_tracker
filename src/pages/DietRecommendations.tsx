import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getFitnessData, type FitnessData, getBMICategory } from '../services/fitnessService';
import './DietRecommendations.css';

type ChatMsg = { id: string; role: 'bot' | 'user' | 'system'; text: string };
type Goal = 'weight_loss' | 'maintenance' | 'muscle_gain';
type DietType = 'omnivore' | 'vegetarian' | 'vegan';
type Meals = 2 | 3 | 4 | 5 | 6;

type ChatState = {
  goal?: Goal;
  dietType?: DietType;
  mealsPerDay?: Meals;
  allergies?: string;
  cookingTime?: 'quick' | 'normal' | 'mealprep';
};

const QUICK_REPLIES: Record<string, { label: string; value: string }[]> = {
  goal: [
    { label: 'Lose weight', value: 'weight_loss' },
    { label: 'Maintain', value: 'maintenance' },
    { label: 'Build muscle', value: 'muscle_gain' },
  ],
  dietType: [
    { label: 'Omnivore', value: 'omnivore' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
  ],
  mealsPerDay: [
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
  ],
  cookingTime: [
    { label: 'Quick', value: 'quick' },
    { label: 'Normal', value: 'normal' },
    { label: 'Meal prep', value: 'mealprep' },
  ],
};

const DietRecommendations: React.FC = () => {
  const [fitness, setFitness] = useState<FitnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
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
        intro.push({ id: 'bot-hello', role: 'bot', text: 'Hi! I can recommend a diet plan tailored to you. What is your primary goal?' });
        setMessages(intro);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Failed to load your profile');
        setMessages([{ id: 'bot-hello', role: 'bot', text: 'Hi! I can recommend a diet plan tailored to you. What is your primary goal?' }]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const currentQuestion = useMemo(() => {
    switch (step) {
      case 0: return { key: 'goal', text: 'Choose your primary goal.' } as const;
      case 1: return { key: 'dietType', text: 'What diet style do you prefer?' } as const;
      case 2: return { key: 'mealsPerDay', text: 'How many meals per day?' } as const;
      case 3: return { key: 'cookingTime', text: 'How much time for cooking?' } as const;
      case 4: return { key: 'allergies', text: 'Any allergies or foods to avoid? (optional)' } as const;
      default: return null;
    }
  }, [step]);

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
    append({ role: 'user', text: formatForDisplay(currentQuestion.key, value) });

    setState(prev => {
      const next = { ...prev } as ChatState;
      switch (currentQuestion.key) {
        case 'goal': next.goal = value as Goal; break;
        case 'dietType': next.dietType = value as DietType; break;
        case 'mealsPerDay': {
          const n = Number(value);
          const allowed: Meals[] = [2, 3, 4, 5, 6];
          if (Number.isInteger(n) && (allowed as number[]).includes(n)) {
            next.mealsPerDay = n as Meals;
          } else {
            // Preserve previous valid value if present, else use safe default 3
            next.mealsPerDay = (prev.mealsPerDay && (allowed as number[]).includes(prev.mealsPerDay) ? prev.mealsPerDay : 3) as Meals;
          }
          break;
        }
        case 'cookingTime': next.cookingTime = value as ChatState['cookingTime']; break;
        case 'allergies': next.allergies = value; break;
      }
      return next;
    });

    if (step < 4) {
      const nextStep = step + 1;
      setStep(nextStep);
      setTimeout(() => append({ role: 'bot', text: getQuestionText(nextStep) }), 250);
    } else {
      setTimeout(() => finalizePlan(), 350);
    }
  };

  const getQuestionText = (s: number) => {
    switch (s) {
      case 0: return 'Choose your primary goal.';
      case 1: return 'What diet style do you prefer?';
      case 2: return 'How many meals per day?';
      case 3: return 'How much time for cooking?';
      case 4: return 'Any allergies or foods to avoid? (optional)';
      default: return '';
    }
  };

  const formatForDisplay = (key: string, value: string) => {
    if (key === 'goal') {
      const map: Record<string, string> = { weight_loss: 'Weight loss', maintenance: 'Maintenance', muscle_gain: 'Build muscle' };
      return map[value] || value;
    }
    if (key === 'dietType') return value.charAt(0).toUpperCase() + value.slice(1);
    if (key === 'mealsPerDay') return `${value} meals/day`;
    if (key === 'cookingTime') {
      const map: Record<string, string> = { quick: 'Quick', normal: 'Normal', mealprep: 'Meal prep' };
      return map[value] || value;
    }
    return value;
  };

  const finalizePlan = () => {
    const s = { ...state };
    if (!s.mealsPerDay) s.mealsPerDay = 3;
    const summary = buildDietPlanSummary(s, fitness || undefined);
    setPlan(summary);
    append({ role: 'bot', text: 'Here is your personalized daily target and sample meal split:' });
    append({ role: 'bot', text: summary });
  };

  const estimateBMR = (f: FitnessData): number => {
    // Mifflin-St Jeor
    const w = f.weight; // kg
    const h = f.height; // cm
    const a = f.age; // years
    if (f.gender === 'male') return 10 * w + 6.25 * h - 5 * a + 5;
    return 10 * w + 6.25 * h - 5 * a - 161;
  };

  const estimateMaintenance = (f: FitnessData | null): number | null => {
    if (!f || !f.height || !f.weight || !f.age) return null;
    const bmr = estimateBMR(f);
    // Lightly active default (no activity input here); can be adjusted later
    const activity = 1.4;
    return Math.round(bmr * activity);
  };

  const buildDietPlanSummary = (s: ChatState, f?: FitnessData) => {
    const lines: string[] = [];
    const maintenance = estimateMaintenance(f || null);
    const goal = s.goal || 'maintenance';
    let target = maintenance || 2000;

    // Adjust calories by goal
    if (maintenance) {
      if (goal === 'weight_loss') target = maintenance - 400; // moderate deficit
      if (goal === 'muscle_gain') target = maintenance + 250; // small surplus
      if (goal === 'maintenance') target = maintenance;
    }
    target = Math.max(1200, Math.round(target));

    // Macro distribution
    let pct = { protein: 0.3, carbs: 0.4, fat: 0.3 };
    if (goal === 'weight_loss') pct = { protein: 0.35, carbs: 0.35, fat: 0.3 };
    if (goal === 'muscle_gain') pct = { protein: 0.3, carbs: 0.45, fat: 0.25 };

    // If fitness available, set protein target by bodyweight (g/kg) bounds
    let proteinG = Math.round((pct.protein * target) / 4);
    if (f?.weight) {
      const bwProtein = Math.round(Math.min(2.2, Math.max(1.6, goal === 'weight_loss' ? 2.0 : 1.8)) * f.weight);
      proteinG = Math.max(proteinG, bwProtein);
    }
    const fatG = Math.round((pct.fat * target) / 9);
    // Compute carbs from remaining calories; clamp to 0 to avoid negative carb values
    const rawCarbs = (target - (proteinG * 4 + fatG * 9)) / 4;
    const carbsG = Math.max(0, Math.round(rawCarbs));
    const carbsClamped = rawCarbs < 0;
    // Note: If protein + fat calories exceed target, carbs will be 0.
    // Depending on business rules, we could instead cap protein/fat or surface a UI warning.

    const header = `Goal: ${formatForDisplay('goal', goal)}${f?.bmi ? ` | BMI ${f.bmi} (${getBMICategory(f.bmi)})` : ''}`;
    lines.push(header);
    lines.push(`Target Calories: ${target} kcal/day${maintenance ? ` (maint. ~${maintenance})` : ''}`);
    lines.push(`Macros: Protein ${proteinG}g, Carbs ${carbsG}g, Fat ${fatG}g`);
    if (carbsClamped) {
      lines.push('Note: Protein + fat exceed calorie target; carbs set to 0.');
    }
    if (s.allergies) lines.push(`Avoid: ${s.allergies}`);
    lines.push('');

    // Sample meal split
    const meals = s.mealsPerDay || 3;
    const perMeal = (val: number) => Math.round(val / meals);
    lines.push(`Meals per day: ${meals} (${formatForDisplay('cookingTime', s.cookingTime || 'normal')})`);
    for (let i = 1; i <= meals; i++) {
      lines.push(`Meal ${i}: ~${perMeal(target)} kcal | P ${perMeal(proteinG)}g | C ${perMeal(carbsG)}g | F ${perMeal(fatG)}g`);
    }
    lines.push('');

    // Food suggestions
    const diet = s.dietType || 'omnivore';
    const suggestions = getFoodSuggestions(diet);
    lines.push('Suggestions:');
    suggestions.forEach(sug => lines.push(`  - ${sug}`));

    return lines.join('\n');
  };

  const getFoodSuggestions = (diet: DietType): string[] => {
    if (diet === 'vegan') {
      return [
        'Tofu stir-fry + quinoa + veggies',
        'Oats + soy yogurt + berries + chia',
        'Lentil chili + brown rice',
        'Chickpea salad + avocado + nuts',
      ];
    }
    if (diet === 'vegetarian') {
      return [
        'Greek yogurt bowl + granola + fruit',
        'Eggs + whole grain toast + greens',
        'Paneer/tempeh curry + rice + veg',
        'Cottage cheese + mixed fruit + nuts',
      ];
    }
    // omnivore
    return [
      'Chicken + rice + veggies',
      'Egg omelet + toast + fruit',
      'Salmon + sweet potato + salad',
      'Lean beef + quinoa + greens',
    ];
  };

  const handleStartOver = () => {
    setState({});
    setStep(0);
    setPlan(null);
    setMessages(prev => prev.filter(m => m.role === 'system'));
    setTimeout(() => append({ role: 'bot', text: 'What is your primary goal?' }), 100);
  };

  const renderQuickReplies = () => {
    if (!currentQuestion || plan) return null;
    const key = currentQuestion.key;
    if (key === 'allergies') return null;
    const choices = (QUICK_REPLIES as Record<string, { label: string; value: string }[]>)[key];
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
      <div className="drp-page">
        <div className="drp-hero">
          <h1 className="drp-title">Diet Recommendations</h1>
          <p className="drp-sub">Calorie and macro targets tailored to you.</p>
        </div>
        <div className="drp-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drp-page">
      <div className="drp-hero">
        <h1 className="drp-title">Diet Recommendations</h1>
        <p className="drp-sub">Chat with your nutrition coach to build a plan.</p>
        {error && <p className="drp-error">{error}</p>}
      </div>

      <div className="drp-chat drp-card">
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

export default DietRecommendations;
