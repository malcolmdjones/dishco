
import { Recipe } from './Recipe';

export interface FoodDatabaseItem {
  id: string;
  name: string;
  brand?: string;
  servingSize?: string;
  servingUnit?: string;
  isCommon: boolean;
  imageSrc: string | null;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

export interface LoggedMeal {
  id: string;
  name: string;
  recipe: Recipe;
  calories: number;
  protein?: string;
  servingInfo?: string;
  brand?: string;
  source?: string;
  type: string;
  date: string;
  consumed: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  brand?: string;
  servingSize?: string;
  servingUnit?: string;
  imageSrc?: string | null;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

export interface FoodDatabaseService {
  searchFoods: (query: string) => Promise<FoodDatabaseItem[]>;
  getRecentFoods: () => FoodDatabaseItem[];
  addToRecentFoods: (food: FoodDatabaseItem) => void;
  scanBarcode: (code: string) => Promise<FoodDatabaseItem | null>;
}
