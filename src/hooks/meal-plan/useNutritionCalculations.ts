
import { MealPlanDay, calculateDailyMacros } from '@/types/MealPlanTypes';

interface NutritionCalculationsProps {
  mealPlan: MealPlanDay[];
  currentDay: number;
  userGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * Hook to handle nutrition-related calculations for meal plans
 */
export const useNutritionCalculations = ({
  mealPlan,
  currentDay,
  userGoals
}: NutritionCalculationsProps) => {
  // Calculate current day's nutrition totals
  const calculateDayTotals = () => {
    if (!mealPlan[currentDay]) return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    const dayMeals = mealPlan[currentDay].meals;
    return calculateDailyMacros(dayMeals);
  };

  // Check if current meals exceed user goals
  const checkExceedsGoals = () => {
    const totals = calculateDayTotals();
    const exceeds = {
      calories: totals.calories > userGoals.calories + 75,
      protein: totals.protein > userGoals.protein + 2,
      carbs: totals.carbs > userGoals.carbs + 5,
      fat: totals.fat > userGoals.fat + 5
    };
    
    return {
      any: exceeds.calories || exceeds.protein || exceeds.carbs || exceeds.fat,
      exceeds
    };
  };

  return {
    calculateDayTotals,
    checkExceedsGoals
  };
};
