
// src/types/food.ts
export interface ExternalFood {
  id: string;
  name: string;
  description?: string;
  type?: string;
  imageSrc?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  servingSize?: string;
  servingUnit?: string;
  brand?: string;
  externalId: string;
  source?: string;
}

export interface LoggedMeal {
  id: string;
  name: string;
  type: string;
  recipe: any;
  consumed: boolean;
  loggedAt: string;
  loggedFromScreen?: string;
  calories: number;
  protein?: string;
  brand?: string;
  servingInfo?: string;
  source?: string;
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  brand?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  servingSize?: string;
  servingUnit?: string;
  imageSrc?: string;
  type?: string;
  isCommon: boolean;
}

// OpenFoodFacts specific types
export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
  quantity?: string;
  serving_size?: string;
}

export interface OpenFoodFactsResponse {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: OpenFoodFactsProduct[];
}
