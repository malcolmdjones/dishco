
import { Recipe as MealPlanRecipe } from '@/types/MealPlan';
import { Recipe as MockDataRecipe } from '@/data/mockData';

/**
 * Convert a Recipe from MealPlan type to MockData type
 */
export const convertToMockDataRecipe = (recipe: MealPlanRecipe): MockDataRecipe => {
  return {
    ...recipe,
    requiresBlender: recipe.requiresBlender || false,
    requiresCooking: recipe.requiresCooking || false,
    cookTime: recipe.cookTime || 0,
    prepTime: recipe.prepTime || 0,
    servings: recipe.servings || 1
  } as MockDataRecipe;
};

/**
 * Convert a Recipe from MockData type to MealPlan type
 */
export const convertToMealPlanRecipe = (recipe: MockDataRecipe): MealPlanRecipe => {
  return recipe as unknown as MealPlanRecipe;
};
