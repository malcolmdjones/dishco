
import { Recipe } from "@/data/mockData";

export interface SavedMealPlan {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  meals: Meal[];
  created_at?: string;
  plan_data?: MealPlanData;
  user_id?: string;
}

export interface MealPlanData {
  days?: MealPlanDay[];
  description?: string;
  tags?: string[];
}

export interface MealPlanDay {
  date: string;
  meals: {
    breakfast: Recipe | Recipe[] | null;
    lunch: Recipe | Recipe[] | null;
    dinner: Recipe | Recipe[] | null;
    snacks: Recipe[];
  };
}

export interface Meal {
  id: string;
  day: string;
  type: string;
  recipe_id: string;
}

// Renamed from MealPlan (which was causing conflicts) to MealPlanType
export interface MealPlanType {
  id: string;
  name: string;
  plan_data?: MealPlanData;
  created_at?: string;
}

// Add ActiveMealPlan type that was missing
export interface ActiveMealPlan {
  plan: MealPlanType;
  startDate: string;
  endDate: string;
  days: number;
}
