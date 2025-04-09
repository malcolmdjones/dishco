
import { Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';

// Database recipe interface moved from useRecipes
export interface DbRecipe {
  id: string;
  title: string | null;
  short_description: string | null;
  type: string | null;
  meal_prep: boolean | null;
  prep_duration_days: string | null;
  servings: number | null;
  prep_time: string | null;
  cook_time: string | null;
  total_time: string | null;
  price_range: string | null;
  calorie_bracket: string | null;
  nutrition_calories: number | null;
  nutrition_protein: number | null;
  nutrition_carbs: number | null;
  nutrition_fat: number | null;
  ingredients_json: any | null;
  instructions_json: any | null;
  tags: string | null;
  protein_focus: string | null;
  cuisine: string | null;
  dietary_tags: string | null;
  upc_ingredients: any | null;
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
}

// Convert database recipe to frontend recipe format
export const dbToFrontendRecipe = (dbRecipe: DbRecipe): Recipe => {
  // Parse ingredients and instructions from JSON if available
  const ingredients = dbRecipe.ingredients_json ? 
    Array.isArray(dbRecipe.ingredients_json) ? 
    dbRecipe.ingredients_json : [] : [];
  
  const instructions = dbRecipe.instructions_json ? 
    Array.isArray(dbRecipe.instructions_json) ? 
    dbRecipe.instructions_json : [] : [];

  // Calculate cooking time in minutes (if it's a string, try to convert or default to 0)
  const cookTimeNum = dbRecipe.cook_time ? 
    (typeof dbRecipe.cook_time === 'string' ? 
      parseInt(dbRecipe.cook_time, 10) || 0 : dbRecipe.cook_time) : 0;

  // Calculate prep time in minutes (if it's a string, try to convert or default to 0)
  const prepTimeNum = dbRecipe.prep_time ? 
    (typeof dbRecipe.prep_time === 'string' ? 
      parseInt(dbRecipe.prep_time, 10) || 0 : dbRecipe.prep_time) : 0;

  return {
    id: dbRecipe.id,
    name: dbRecipe.title || '',
    description: dbRecipe.short_description || '',
    type: dbRecipe.type || 'meal',
    imageSrc: getRecipeImage(dbRecipe.image_url),
    requiresBlender: dbRecipe.blender || false,
    requiresCooking: true, // Default to true as most recipes require cooking
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

// Convert frontend recipe to database format for insertion
export const frontendToDbRecipe = (recipe: Recipe): Partial<DbRecipe> => {
  return {
    title: recipe.name,
    short_description: recipe.description || '',
    type: recipe.type || 'meal',
    meal_prep: false,
    prep_duration_days: null,
    servings: recipe.servings || 1,
    prep_time: recipe.prepTime?.toString() || '0',
    cook_time: recipe.cookTime?.toString() || '0',
    total_time: ((recipe.prepTime || 0) + (recipe.cookTime || 0)).toString(),
    nutrition_calories: recipe.macros.calories || 0,
    nutrition_protein: recipe.macros.protein || 0,
    nutrition_carbs: recipe.macros.carbs || 0,
    nutrition_fat: recipe.macros.fat || 0,
    ingredients_json: recipe.ingredients || [],
    instructions_json: recipe.instructions || [],
    tags: null,
    protein_focus: null,
    cuisine: null,
    dietary_tags: null,
    upc_ingredients: null,
    image_url: recipe.imageSrc || null,
    created_by: null,
    is_public: true,
    blender: recipe.requiresBlender || false,
    stovetop: true // Assuming most recipes use stovetop by default
  };
};
