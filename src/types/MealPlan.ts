
export interface MealPlan {
  id: string;
  name: string;
  user_id?: string;
  created_at?: string;
  plan_data: PlanData;
}

export interface PlanData {
  days?: Day[];
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export interface Day {
  date?: string;
  meals: {
    breakfast?: Recipe | Recipe[];
    lunch?: Recipe | Recipe[];
    dinner?: Recipe | Recipe[];
    snacks?: Recipe[];
    [key: string]: any;
  };
}

// Expanded Recipe interface to match the one from mockData
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  type?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageSrc?: string;
  ingredients?: string[];
  instructions?: string[];
  // Additional properties from mockData.Recipe
  requiresBlender?: boolean;
  requiresCooking?: boolean;
  cookTime?: number;
  prepTime?: number;
  servings?: number;
  [key: string]: any;
}
