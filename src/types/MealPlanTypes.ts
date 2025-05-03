
import { Recipe } from './Recipe';

export interface MealPlanDay {
  date: string;
  meals: {
    breakfast: Recipe[] | Recipe | null;
    lunch: Recipe[] | Recipe | null;
    dinner: Recipe[] | Recipe | null;
    snacks: Recipe[] | Recipe[] | null;
  };
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserMeal {
  id: string;
  recipe: Recipe[] | Recipe;
  date: string;
  type: string;
  consumed: boolean;
  quantity?: number;
}

export const calculateDailyMacros = (meals: any) => {
  const dailyTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  const processRecipe = (recipe: Recipe) => {
    if (recipe?.macros) {
      dailyTotals.calories += recipe.macros.calories || 0;
      dailyTotals.protein += recipe.macros.protein || 0;
      dailyTotals.carbs += recipe.macros.carbs || 0;
      dailyTotals.fat += recipe.macros.fat || 0;
    }
  };

  Object.entries(meals).forEach(([mealType, mealRecipes]) => {
    if (Array.isArray(mealRecipes)) {
      mealRecipes.forEach(recipe => {
        if (recipe) processRecipe(recipe);
      });
    } else if (mealRecipes) {
      processRecipe(mealRecipes as Recipe);
    }
  });

  return dailyTotals;
};

// Default nutrition goals
export const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 200,
  fat: 65
};

// Function to fetch nutrition goals (to be replaced with actual API)
export const fetchNutritionGoals = async (): Promise<NutritionGoals> => {
  return defaultGoals;
};
