
import { Recipe } from '@/data/mockData';
import { getTypeBasedImage } from '@/utils/recipeUtils';
import { Json } from '@/integrations/supabase/types';

// Database recipe interface updated to match the actual database schema
export interface DbRecipe {
  user_id: string;
  title: string | null;
  short_description: string | null;
  type: string | null;
  meal_prep: boolean | null;
  prep_duration_days: string | null;
  servings: number | null;
  prep_time: string | null;
  cook_time: string | null; // Database stores this as string
  total_time: string | null;
  price_range: string | null;
  calorie_bracket: string | null;
  nutrition_calories: number | null;
  nutrition_protein: number | null;
  nutrition_carbs: number | null;
  nutrition_fat: number | null;
  ingredients_json: Json | null;
  instructions_json: Json | null;
  tags: Json | null;
  protein_focus: string | null;
  cuisine: string | null;
  dietary_tags: string | null;
  upc_ingredients: Json | null;
  image_url: string | null;
  created_by: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  oven: boolean | null;
  stovetop: boolean | null;
  air_fryer: boolean | null;
  blender: boolean | null;
  grill: boolean | null;
  slow_cooker: boolean | null;
  dish_category: string | null;
  store_bought: boolean | null;
  nutrition_fiber: number | null;
  nutrition_serving: string | null;
  upc: string | null;
}

// Convert database recipe to frontend recipe format
export const dbToFrontendRecipe = (dbRecipe: DbRecipe): Recipe => {
  // Parse ingredients and instructions from JSON if available
  const ingredients = dbRecipe.ingredients_json ? 
    Array.isArray(dbRecipe.ingredients_json) ? 
    dbRecipe.ingredients_json as string[] : [] : [];
  
  const instructions = dbRecipe.instructions_json ? 
    Array.isArray(dbRecipe.instructions_json) ? 
    dbRecipe.instructions_json as string[] : [] : [];

  // Calculate cooking time in minutes (if it's a string, try to convert or default to 0)
  const cookTimeNum = dbRecipe.cook_time ? 
    (typeof dbRecipe.cook_time === 'string' ? 
      parseInt(dbRecipe.cook_time, 10) || 0 : dbRecipe.cook_time) : 0;

  // Calculate prep time in minutes (if it's a string, try to convert or default to 0)
  const prepTimeNum = dbRecipe.prep_time ? 
    (typeof dbRecipe.prep_time === 'string' ? 
      parseInt(dbRecipe.prep_time, 10) || 0 : dbRecipe.prep_time) : 0;

  return {
    id: dbRecipe.user_id, // Use user_id as the recipe ID
    name: dbRecipe.title || '',
    description: dbRecipe.short_description || '',
    type: dbRecipe.type || 'meal',
    imageSrc: dbRecipe.image_url || getTypeBasedImage(dbRecipe.type),
    requiresBlender: dbRecipe.blender || false,
    requiresCooking: dbRecipe.stovetop || dbRecipe.oven || true, // If any cooking method is true, or default to true
    cookTime: cookTimeNum,
    prepTime: prepTimeNum,
    servings: dbRecipe.servings || 1,
    macros: {
      calories: dbRecipe.nutrition_calories || 0,
      protein: dbRecipe.nutrition_protein || 0,
      carbs: dbRecipe.nutrition_carbs || 0,
      fat: dbRecipe.nutrition_fat || 0
    },
    ingredients,
    instructions
  };
};

// Helper function to ensure we have default images for recipes
export const getRecipeImageFallback = (type: string | null | undefined): string => {
  const defaultImages = {
    breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666",
    lunch: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    dinner: "https://images.unsplash.com/photo-1564834733143-6701a4b8fec9", 
    snack: "https://images.unsplash.com/photo-1599642080669-0db91ed448fc",
    dessert: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
  };
  
  if (!type) return defaultImages.default;
  
  const normalizedType = type.toLowerCase();
  return defaultImages[normalizedType as keyof typeof defaultImages] || defaultImages.default;
};
