/**
 * Macro split calculation.
 *
 * Rounds macro grams to whole grams, then reconciles them so the macro
 * calories (protein 4 kcal/g, carbs 4 kcal/g, fat 9 kcal/g) add up
 * exactly to the displayed daily total. Rounding each macro
 * independently used to give e.g. 656 + 1,184 + 792 = 2,632 kcal
 * against a 2,628 kcal total.
 */

export interface MacroSplit {
  name: string;
  protein: number; // percent of calories
  carbs: number; // percent of calories
  fat: number; // percent of calories
}

export interface MacroResult {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

const CAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;
type MacroKey = keyof typeof CAL_PER_GRAM;

export function calculateMacros(
  targetCalories: number,
  split: MacroSplit
): MacroResult {
  const exact: Record<MacroKey, number> = {
    protein: (targetCalories * (split.protein / 100)) / 4,
    carbs: (targetCalories * (split.carbs / 100)) / 4,
    fat: (targetCalories * (split.fat / 100)) / 9,
  };
  const grams: Record<MacroKey, number> = {
    protein: Math.round(exact.protein),
    carbs: Math.round(exact.carbs),
    fat: Math.round(exact.fat),
  };
  const macroCalories = () =>
    grams.protein * 4 + grams.carbs * 4 + grams.fat * 9;

  // Reduce the macro that was rounded up the most (protein/carbs first,
  // 4 kcal per gram) until the parts sum to the total.
  for (let i = 0; i < 20 && macroCalories() > targetCalories; i++) {
    const over = macroCalories() - targetCalories;
    const candidates = (Object.keys(grams) as MacroKey[]).filter(
      (key) => grams[key] > 0 && CAL_PER_GRAM[key] <= over
    );
    if (candidates.length === 0) break;
    candidates.sort((a, b) => grams[b] - exact[b] - (grams[a] - exact[a]));
    grams[candidates[0]] -= 1;
  }
  // Top the total back up if rounding down left calories unallocated.
  for (let i = 0; i < 20 && macroCalories() < targetCalories; i++) {
    const under = targetCalories - macroCalories();
    const candidates = (Object.keys(grams) as MacroKey[]).filter(
      (key) => CAL_PER_GRAM[key] <= under
    );
    if (candidates.length === 0) break;
    candidates.sort((a, b) => exact[b] - grams[b] - (exact[a] - grams[a]));
    grams[candidates[0]] += 1;
  }

  return {
    calories: macroCalories(),
    protein: grams.protein,
    carbs: grams.carbs,
    fat: grams.fat,
  };
}
