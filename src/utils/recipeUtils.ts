import { CustomRecipe } from '@/hooks/useCustomRecipes';
import { Recipe } from '@/data/mockData';

// Standard image URL to use when no image is available
export const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

/**
 * Convert a CustomRecipe to the standard Recipe format
 */
export const customToStandardRecipe = (customRecipe: CustomRecipe): Recipe => {
  return {
    id: customRecipe.id,
    name: customRecipe.title,
    description: customRecipe.description || '',
    type: 'custom',
    imageSrc: customRecipe.imageUrl || DEFAULT_IMAGE_URL,
    requiresBlender: false,
    requiresCooking: true,
    cookTime: customRecipe.cookingTime || 0,
    prepTime: 0,
    servings: customRecipe.servings || 1,
    macros: customRecipe.nutrition || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    ingredients: customRecipe.ingredients 
      ? customRecipe.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`.trim())
      : [],
    instructions: customRecipe.instructions || []
  };
};

/**
 * Convert a standard Recipe to CustomRecipe format
 */
export const standardToCustomRecipe = (recipe: Recipe): Omit<CustomRecipe, 'id' | 'createdAt'> => {
  // Parse ingredients from strings to structured format
  const ingredients = recipe.ingredients.map(ing => {
    const parts = ing.split(' ');
    const quantity = parts[0] || '';
    const unit = parts[1] || '';
    const name = parts.slice(2).join(' ');
    
    return { quantity, unit, name };
  });
  
  return {
    title: recipe.name,
    description: recipe.description,
    imageUrl: recipe.imageSrc,
    cookingTime: recipe.cookTime || 0,
    servings: recipe.servings || 1,
    ingredients,
    instructions: recipe.instructions,
    nutrition: recipe.macros
  };
};

/**
 * Check if a recipe has an image, if not return the default image
 */
export const getRecipeImage = (imageSrc: string | null | undefined): string => {
  return imageSrc || DEFAULT_IMAGE_URL;
};

// Add compatibility for recipehub
export const getRecipeTypeLabel = (type: string | undefined): string => {
  if (!type) return 'Recipe';
  
  const typeMap: Record<string, string> = {
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'snack': 'Snack',
    'dessert': 'Dessert',
    'drink': 'Drink',
    'meal': 'Meal',
    'store-bought': 'Store Bought',
  };
  
  return typeMap[type.toLowerCase()] || type;
};

// Add a helper function to check if a recipe is store-bought
export const isStoreBought = (recipe: any): boolean => {
  return recipe.storeBought === true || recipe.store_bought === true;
};
