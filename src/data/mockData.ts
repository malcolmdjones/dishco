
export interface Recipe {
  id: string;
  name: string;
  type: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageSrc: string;
  cuisineType?: string;
  priceRange?: string;
  isHighProtein?: boolean;
  equipment?: string[];
  dietaryNeeds?: string[];
  requiresBlender?: boolean;
  requiresCooking?: boolean;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlanDay {
  date: string;
  meals: {
    breakfast: Recipe | null;
    lunch: Recipe | null;
    dinner: Recipe | null;
    snacks: (Recipe | null)[];
  };
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  quantity?: string;
}

// Default nutrition goals
export const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65
};

// Sample recipes - Empty array as we're using database recipes
export const recipes: Recipe[] = [];

// Calculate daily macros from meals
export const calculateDailyMacros = (meals: any) => {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
  
  if (meals.breakfast) {
    totals.calories += meals.breakfast.macros.calories || 0;
    totals.protein += meals.breakfast.macros.protein || 0;
    totals.carbs += meals.breakfast.macros.carbs || 0;
    totals.fat += meals.breakfast.macros.fat || 0;
  }
  
  if (meals.lunch) {
    totals.calories += meals.lunch.macros.calories || 0;
    totals.protein += meals.lunch.macros.protein || 0;
    totals.carbs += meals.lunch.macros.carbs || 0;
    totals.fat += meals.lunch.macros.fat || 0;
  }
  
  if (meals.dinner) {
    totals.calories += meals.dinner.macros.calories || 0;
    totals.protein += meals.dinner.macros.protein || 0;
    totals.carbs += meals.dinner.macros.carbs || 0;
    totals.fat += meals.dinner.macros.fat || 0;
  }
  
  if (meals.snacks && Array.isArray(meals.snacks)) {
    for (const snack of meals.snacks) {
      if (snack) {
        totals.calories += snack.macros.calories || 0;
        totals.protein += snack.macros.protein || 0;
        totals.carbs += snack.macros.carbs || 0;
        totals.fat += snack.macros.fat || 0;
      }
    }
  }
  
  return totals;
};

// Mock function to fetch nutrition goals
export const fetchNutritionGoals = async (): Promise<NutritionGoals> => {
  return Promise.resolve(defaultGoals);
};

// Generate a grocery list from a meal plan
export const generateGroceryList = (mealPlan: MealPlanDay[]): GroceryItem[] => {
  const groceryItems: GroceryItem[] = [];
  
  // This is a placeholder implementation
  return groceryItems;
};

// Generate a mock meal plan (placeholder for backward compatibility)
export const generateMockMealPlan = () => {
  const days: MealPlanDay[] = [];
  return { days };
};
