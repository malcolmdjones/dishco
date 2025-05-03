
import { Recipe } from '@/types/Recipe';

// Takes a raw recipe from the database and converts it to our frontend Recipe type
export const convertDbRecipeToFrontend = (dbRecipe: any): Recipe => {
  return {
    id: dbRecipe.id || `temp-${Date.now()}`,
    name: dbRecipe.title || 'Untitled Recipe',
    description: dbRecipe.short_description || '',
    type: dbRecipe.type || 'recipe',
    imageSrc: dbRecipe.image_url || null,
    requiresBlender: dbRecipe.blender || false,
    requiresCooking: dbRecipe.stovetop || dbRecipe.oven || false,
    cookTime: dbRecipe.cook_time || 0,
    prepTime: dbRecipe.prep_time || 0,
    servings: dbRecipe.servings || 1,
    macros: {
      calories: dbRecipe.nutrition_calories || 0,
      protein: dbRecipe.nutrition_protein || 0,
      carbs: dbRecipe.nutrition_carbs || 0,
      fat: dbRecipe.nutrition_fat || 0,
      fiber: dbRecipe.nutrition_fiber || 0
    },
    ingredients: dbRecipe.ingredients_json || [],
    instructions: dbRecipe.instructions_json || [],
    externalSource: false,
    storeBought: dbRecipe.store_bought || false,
    tags: dbRecipe.tags || []
  };
};
