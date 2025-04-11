
import { Recipe as MealPlanRecipe } from '@/types/MealPlan';
import { Recipe as MockDataRecipe } from '@/data/mockData';
import { convertToMockDataRecipe } from '@/utils/typeUtils';

export const getMealData = (meal: MealPlanRecipe | MealPlanRecipe[] | MockDataRecipe | MockDataRecipe[] | undefined | null): MealPlanRecipe | MockDataRecipe | null => {
  if (!meal) return null;
  
  // Handle array case - return the first item
  if (Array.isArray(meal) && meal.length > 0) {
    // If it's a MealPlanRecipe[], ensure we convert it properly
    if ('id' in meal[0] && 'name' in meal[0] && 'macros' in meal[0]) {
      return meal[0];
    }
    return null;
  }
  
  // It's a single item
  return meal;
};
