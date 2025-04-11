
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
  [key: string]: any;
}
