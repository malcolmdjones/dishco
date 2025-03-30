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
}
