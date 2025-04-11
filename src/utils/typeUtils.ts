
import { Recipe as MealPlanRecipe } from '@/types/MealPlan';
import { Recipe as MockDataRecipe } from '@/data/mockData';

/**
 * Convert a Recipe from MealPlan type to MockData type
 */
export const convertToMockDataRecipe = (recipe: MealPlanRecipe): MockDataRecipe => {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description || '', // MockData.Recipe requires description
    type: recipe.type || 'unknown',
    imageSrc: recipe.imageSrc || '',
    requiresBlender: recipe.requiresBlender || false,
    requiresCooking: recipe.requiresCooking || false,
    cookTime: recipe.cookTime || 0,
    prepTime: recipe.prepTime || 0,
    servings: recipe.servings || 1,
    macros: recipe.macros,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || []
  };
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
    breakfast: convertSingleOrArray(meals.breakfast) || null,
    lunch: convertSingleOrArray(meals.lunch) || null,
    dinner: convertSingleOrArray(meals.dinner) || null,
    snacks: meals.snacks ? meals.snacks.map(snack => convertToMockDataRecipe(snack)) : []
  };
};
