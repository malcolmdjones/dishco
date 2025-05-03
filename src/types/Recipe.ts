
/**
 * Recipe interface for the application
 * This replaces the one that was previously in mockData.ts
 */
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  type?: string;
  imageSrc?: string | null;
  requiresBlender?: boolean;
  requiresCooking?: boolean;
  cookTime?: number;
  prepTime?: number;
  servings?: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  ingredients?: any[];
  instructions?: any[];
  externalSource?: boolean;
  externalId?: string;
  storeBought?: boolean;
  tags?: string[];
}

// Default empty values for a Recipe
export const emptyRecipe: Recipe = {
  id: '',
  name: '',
  description: '',
  type: '',
  imageSrc: null,
  macros: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  },
  ingredients: [],
  instructions: []
};
