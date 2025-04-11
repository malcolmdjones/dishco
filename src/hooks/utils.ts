
import { Recipe } from '@/types/MealPlan';

export const getMealData = (meal: Recipe | Recipe[] | undefined | null): Recipe | null => {
  if (!meal) return null;
  
  if (Array.isArray(meal) && meal.length > 0) {
    return meal[0];
  }
  
  return meal as Recipe;
};
