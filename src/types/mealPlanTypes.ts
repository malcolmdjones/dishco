
import { Recipe } from '@/data/mockData';

export type MealPlanData = {
  days: Array<{
    date: string;
    meals: {
      breakfast?: any;
      lunch?: any;
      dinner?: any;
      snacks?: any[];
    };
  }>;
  description?: string;
  tags?: string[];
};

export type MealPlan = {
  id: string;
  name: string;
  created_at: string;
  schema_version?: number;
  plan_data: MealPlanData;
  user_id?: string;
};

export type ActiveMealPlan = {
  plan: MealPlan;
  startDay: number;
  startDate: string; // ISO string date when the plan starts
  endDate: string;   // ISO string date when the plan ends
};
