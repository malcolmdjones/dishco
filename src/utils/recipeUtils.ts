
import { Recipe } from '@/types/Recipe';

// Default image for recipes
const DEFAULT_RECIPE_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D";

export const getRecipeImage = (imageSrc?: string | null): string => {
  return imageSrc || DEFAULT_RECIPE_IMAGE;
};

export const isStoreBought = (recipe: Recipe): boolean => {
  return recipe.storeBought === true || recipe.type === 'store-bought';
};

export const formatCookingTime = (time?: number): string => {
  if (!time) return 'N/A';
  if (time < 60) return `${time} min`;
  
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  
  if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${minutes}m`;
};

export const categorizeRecipe = (recipe: Recipe): string => {
  // Categorize recipe by type, falling back to different strategies
  if (recipe.type) return recipe.type;
  if (recipe.storeBought) return 'Store-Bought';
  if (recipe.requiresBlender) return 'Blender Recipe';
  if (recipe.requiresCooking) return 'Cooking Required';
  return 'Recipe';
};

export const getMacrosBadgeColor = (macroType: string): string => {
  switch (macroType.toLowerCase()) {
    case 'protein':
      return 'bg-amber-100 text-amber-800';
    case 'carbs':
    case 'carbohydrates':
      return 'bg-blue-100 text-blue-800';
    case 'fat':
    case 'fats':
      return 'bg-green-100 text-green-800';
    case 'calories':
    case 'calorie':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getCalorieBadge = (calories: number): string => {
  if (calories <= 200) return 'Very Low Calorie';
  if (calories <= 400) return 'Low Calorie';
  if (calories <= 600) return 'Moderate Calorie';
  if (calories <= 800) return 'High Calorie';
  return 'Very High Calorie';
};

export const getFormattedServings = (servings?: number): string => {
  if (!servings) return 'N/A';
  return `${servings} ${servings === 1 ? 'serving' : 'servings'}`;
};
