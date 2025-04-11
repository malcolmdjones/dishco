
import { Recipe as MealPlanRecipe } from '@/types/MealPlan';
import { Recipe as MockDataRecipe } from '@/data/mockData';

/**
 * Convert a Recipe from MealPlan type to MockData type
 */
export const convertToMockDataRecipe = (recipe: MealPlanRecipe): MockDataRecipe => {
  return {
    ...recipe,
    description: recipe.description || '',  // MockData.Recipe requires description
    requiresBlender: recipe.requiresBlender || false,
    requiresCooking: recipe.requiresCooking || false,
    cookTime: recipe.cookTime || 0,
    prepTime: recipe.prepTime || 0,
    servings: recipe.servings || 1,
    type: recipe.type || 'unknown',
    imageSrc: recipe.imageSrc || ''
  } as MockDataRecipe;
};

/**
 * Convert a Recipe from MockData type to MealPlan type
 */
export const convertToMealPlanRecipe = (recipe: MockDataRecipe): MealPlanRecipe => {
  return recipe as unknown as MealPlanRecipe;
};

/**
 * Convert meals object from MealPlan type to MockData type for calculateDailyMacros
 */
export const convertMealsForMacroCalculation = (meals: {
  breakfast?: MealPlanRecipe | MealPlanRecipe[];
  lunch?: MealPlanRecipe | MealPlanRecipe[];
  dinner?: MealPlanRecipe | MealPlanRecipe[];
  snacks?: MealPlanRecipe[];
}) => {
  const convertSingleOrArray = (item: MealPlanRecipe | MealPlanRecipe[] | undefined) => {
    if (!item) return null;
    
    if (Array.isArray(item)) {
      return item.map(recipe => convertToMockDataRecipe(recipe));
    }
    
    return convertToMockDataRecipe(item);
  };
  
  return {
    breakfast: convertSingleOrArray(meals.breakfast),
    lunch: convertSingleOrArray(meals.lunch),
    dinner: convertSingleOrArray(meals.dinner),
    snacks: meals.snacks ? meals.snacks.map(snack => convertToMockDataRecipe(snack)) : []
  };
};
