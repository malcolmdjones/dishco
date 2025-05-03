import { Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';
import { Json } from '@/integrations/supabase/types';

// Updated RecipeHubDb interface to match the current Supabase schema
export interface RecipeHubDb {
  // Required fields
  user_id: string;
  
  // Core recipe data
  title: string | null;
  short_description: string | null;
  type: string | null;
  image_url: string | null;
  is_public: boolean | null;
  
  // Cooking details
  meal_prep: boolean | null;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  stovetop: boolean | null;
  oven: boolean | null;
  air_fryer: boolean | null;
  blender: boolean | null;
  grill: boolean | null;
  slow_cooker: boolean | null;
  store_bought: boolean | null;
  
  // Nutrition information
  nutrition_calories: number | null;
  nutrition_protein: number | null;
  nutrition_carbs: number | null;
  nutrition_fat: number | null;
  nutrition_fiber: number | null;
  nutrition_serving: string | null;
  
  // Recipe content
  ingredients_json: Json | null;
  instructions_json: Json | null;
  
  // Additional metadata
  tags: Json | null;
  price_range: string | null;
  cuisine: string | null;
  dish_category: string | null;
  upc: string | null;
  
  /**
   * @deprecated This field is no longer in the database schema
   */
  servings?: number | null;
  
  /**
   * @deprecated This field is no longer in the database schema
   */
  protein_focus?: string | null;
}

/**
 * Sanitizes a recipe object for database insert/update by removing deprecated fields
 * @param recipeData Partial recipe data that may contain deprecated fields
 * @returns Cleaned object ready for database operations
 */
export const sanitizeRecipeForInsert = (recipeData: Partial<RecipeHubDb>): Partial<RecipeHubDb> => {
  // Create a new object without the deprecated fields
  const {
    servings,
    protein_focus,
    ...sanitizedData
  } = recipeData;
  
  return sanitizedData;
};

// Convert database recipe to frontend recipe format
export const recipeHubDbToFrontendRecipe = (dbRecipe: RecipeHubDb): Recipe => {
  // Parse ingredients and instructions from JSON if available
  const ingredients = dbRecipe.ingredients_json ? 
    Array.isArray(dbRecipe.ingredients_json) ? 
    dbRecipe.ingredients_json : [] : [];
  
  const instructions = dbRecipe.instructions_json ? 
    Array.isArray(dbRecipe.instructions_json) ? 
    dbRecipe.instructions_json : [] : [];

  // Calculate cooking time in minutes
  const cookTimeNum = dbRecipe.cook_time ? Number(dbRecipe.cook_time) : 0;

  // Calculate prep time in minutes
  const prepTimeNum = dbRecipe.prep_time ? Number(dbRecipe.prep_time) : 0;

  // Default servings to 1 since it's not in the database schema
  const servings = 1;

  return {
    id: dbRecipe.user_id, // Using user_id as the recipe id since we need an id field
    name: dbRecipe.title || '',
    description: dbRecipe.short_description || '',
    type: dbRecipe.type || 'meal',
    imageSrc: getRecipeImage(dbRecipe.image_url),
    requiresBlender: dbRecipe.blender || false,
    requiresCooking: !(dbRecipe.store_bought || false), // If store_bought is true, doesn't require cooking
    cookTime: cookTimeNum,
    prepTime: prepTimeNum,
    servings: servings,
    macros: {
      calories: dbRecipe.nutrition_calories ? Number(dbRecipe.nutrition_calories) : 0,
      protein: dbRecipe.nutrition_protein ? Number(dbRecipe.nutrition_protein) : 0,
      carbs: dbRecipe.nutrition_carbs ? Number(dbRecipe.nutrition_carbs) : 0,
      fat: dbRecipe.nutrition_fat ? Number(dbRecipe.nutrition_fat) : 0,
      fiber: dbRecipe.nutrition_fiber ? Number(dbRecipe.nutrition_fiber) : 0
    },
    ingredients,
    instructions,
    externalSource: dbRecipe.store_bought || false,
    storeBought: dbRecipe.store_bought || false
  };
};

// Convert frontend recipe to database format for insertion
export const frontendToRecipeHubDb = (recipe: Recipe): Partial<RecipeHubDb> => {
  const dbRecipe: Partial<RecipeHubDb> = {
    title: recipe.name,
    short_description: recipe.description || '',
    type: recipe.type || 'meal',
    meal_prep: false,
    prep_time: recipe.prepTime || 0,
    cook_time: recipe.cookTime || 0,
    total_time: (recipe.prepTime || 0) + (recipe.cookTime || 0),
    nutrition_calories: recipe.macros.calories || 0,
    nutrition_protein: recipe.macros.protein || 0,
    nutrition_carbs: recipe.macros.carbs || 0,
    nutrition_fat: recipe.macros.fat || 0,
    nutrition_fiber: recipe.macros.fiber || 0,
    ingredients_json: recipe.ingredients || [],
    instructions_json: recipe.instructions || [],
    tags: recipe.tags || null,
    cuisine: null,
    image_url: recipe.imageSrc || null,
    is_public: true,
    store_bought: recipe.storeBought || false,
    blender: recipe.requiresBlender || false,
    stovetop: true, // Assuming most recipes use stovetop by default
    air_fryer: false,
    grill: false,
    slow_cooker: false,
    oven: false
  };
  
  // Sanitize the recipe to remove deprecated fields before database operations
  return sanitizeRecipeForInsert(dbRecipe);
};

// Helper to check if a recipe contains specific ingredients
export const recipeContainsIngredient = (recipe: Recipe, ingredientKeywords: string[]): boolean => {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
  
  // Convert ingredients to lowercase for case-insensitive matching
  const lowerCaseIngredients = recipe.ingredients.map(ingredient => {
    if (typeof ingredient === 'string') {
      return ingredient.toLowerCase();
    } else if (typeof ingredient === 'object' && ingredient && 'name' in ingredient) {
      return (ingredient.name as string).toLowerCase();
    }
    return '';
  });
  
  // Check if any ingredient contains any of the keywords
  return lowerCaseIngredients.some(ingredient => 
    ingredientKeywords.some(keyword => ingredient.includes(keyword.toLowerCase()))
  );
};

// Filter recipes based on dietary restrictions
export const filterRecipesByDietaryRestrictions = (recipes: Recipe[], restrictions: string[]): Recipe[] => {
  if (!restrictions || restrictions.length === 0) return recipes;

  return recipes.filter(recipe => {
    // Check for dietary restrictions
    for (const restriction of restrictions) {
      switch (restriction) {
        case 'vegetarian':
          // Filter out recipes with meat products
          if (recipeContainsIngredient(recipe, ['beef', 'chicken', 'pork', 'turkey', 'lamb', 'veal', 'bacon', 'ham', 'sausage'])) {
            return false;
          }
          break;
        case 'vegan':
          // Filter out recipes with animal products
          if (recipeContainsIngredient(recipe, [
            'beef', 'chicken', 'pork', 'turkey', 'lamb', 'veal', 'bacon', 'ham', 'sausage',
            'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'honey'
          ])) {
            return false;
          }
          break;
        case 'gluten-free':
          // Filter out recipes with gluten
          if (recipeContainsIngredient(recipe, ['wheat', 'barley', 'rye', 'flour', 'bread', 'pasta', 'couscous'])) {
            return false;
          }
          break;
        case 'dairy-free':
          // Filter out recipes with dairy
          if (recipeContainsIngredient(recipe, ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey'])) {
            return false;
          }
          break;
        case 'nut-free':
          // Filter out recipes with nuts
          if (recipeContainsIngredient(recipe, ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio'])) {
            return false;
          }
          break;
        case 'pescatarian':
          // Filter out recipes with meat but allow fish
          if (recipeContainsIngredient(recipe, ['beef', 'chicken', 'pork', 'turkey', 'lamb', 'veal', 'bacon', 'ham', 'sausage'])) {
            return false;
          }
          break;
      }
    }
    
    return true;
  });
};

// Get or initialize dietary restrictions from local storage
export const getUserDietaryRestrictions = (): string[] => {
  try {
    const savedRestrictions = localStorage.getItem('dietaryRestrictions');
    if (savedRestrictions) {
      return JSON.parse(savedRestrictions);
    }
  } catch (error) {
    console.error('Error loading dietary restrictions:', error);
  }
  return [];
};
