
import { Recipe } from '../data/mockData';

export interface DayMeals {
  breakfast: Recipe[];
  lunch: Recipe[];
  dinner: Recipe[];
  snacks: Recipe[];
}

export interface DayPlan {
  day: string;
  meals: DayMeals;
}

export type WeeklyMealPlan = DayPlan[];
