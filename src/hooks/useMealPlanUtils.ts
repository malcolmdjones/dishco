
import { useMealPlanState } from './meal-plan/useMealPlanState';
import { useMealGeneration } from './meal-plan/useMealGeneration';
import { useMealManagement } from './meal-plan/useMealManagement';
import { useNutritionCalculations } from './meal-plan/useNutritionCalculations';

/**
 * Main hook that combines all meal plan functionality
 */
export const useMealPlanUtils = () => {
  // Use the separate hooks for different concerns
  const {
    currentDate,
    currentDay,
    setCurrentDay,
    mealPlan,
    setMealPlan,
    userGoals,
    isGenerating,
    setIsGenerating,
    lockedMeals,
    setLockedMeals,
    aiReasoning,
    setAiReasoning,
    generateFullMealPlan
  } = useMealPlanState();

  // Meal generation functionality
  const { regenerateMeals } = useMealGeneration({
    mealPlan,
    setMealPlan,
    currentDay,
    lockedMeals,
    setIsGenerating,
    setAiReasoning
  });

  // Meal management functionality
  const { toggleLockMeal, updateMeal } = useMealManagement({
    mealPlan,
    setMealPlan,
    currentDay,
    lockedMeals,
    setLockedMeals
  });

  // Nutrition calculations
  const { calculateDayTotals, checkExceedsGoals } = useNutritionCalculations({
    mealPlan,
    currentDay,
    userGoals
  });

  return {
    currentDate,
    currentDay,
    setCurrentDay,
    mealPlan,
    userGoals,
    isGenerating,
    lockedMeals,
    aiReasoning,
    generateFullMealPlan,
    regenerateMeals,
    toggleLockMeal,
    updateMeal,
    calculateDayTotals,
    checkExceedsGoals
  };
};
