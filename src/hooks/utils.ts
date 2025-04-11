
import { Recipe as MealPlanRecipe } from '@/types/MealPlan';
import { Recipe as MockDataRecipe } from '@/data/mockData';

export const getMealData = (meal: MealPlanRecipe | MealPlanRecipe[] | MockDataRecipe | MockDataRecipe[] | undefined | null): MealPlanRecipe | MockDataRecipe | null => {
  if (!meal) return null;
  
  if (Array.isArray(meal) && meal.length > 0) {
    return meal[0];
  }
  
  return meal;
};
