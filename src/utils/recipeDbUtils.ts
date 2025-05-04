
export interface DbRecipe {
  id: string;
  title: string;
  short_description?: string;
  image_url?: string;
  type?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  nutrition_calories?: number;
  nutrition_protein?: number;
  nutrition_carbs?: number;
  nutrition_fat?: number;
  nutrition_fiber?: number;
  ingredients_json?: any[];
  instructions_json?: any[];
  tags?: string[];
  cuisine?: string;
  oven?: boolean;
  stovetop?: boolean;
  blender?: boolean;
  air_fryer?: boolean;
  slow_cooker?: boolean;
  grill?: boolean;
}

export const dbToFrontendRecipe = (dbRecipe: DbRecipe): any => {
  return {
    id: dbRecipe.id || Math.random().toString(),
    name: dbRecipe.title || 'Untitled Recipe',
    description: dbRecipe.short_description || '',
    imageSrc: dbRecipe.image_url || '',
    type: dbRecipe.type?.toLowerCase() || 'recipe',
    prepTime: dbRecipe.prep_time || 0,
    cookTime: dbRecipe.cook_time || 0,
    servings: dbRecipe.servings || 0,
    macros: {
      calories: dbRecipe.nutrition_calories || 0,
      protein: dbRecipe.nutrition_protein || 0,
      carbs: dbRecipe.nutrition_carbs || 0,
      fat: dbRecipe.nutrition_fat || 0,
      fiber: dbRecipe.nutrition_fiber || 0,
    },
    ingredients: dbRecipe.ingredients_json || [],
    instructions: dbRecipe.instructions_json || [],
    tags: dbRecipe.tags || [],
    cuisine: dbRecipe.cuisine || '',
    equipment: {
      oven: dbRecipe.oven || false,
      stovetop: dbRecipe.stovetop || false,
      blender: dbRecipe.blender || false,
      airFryer: dbRecipe.air_fryer || false,
      slowCooker: dbRecipe.slow_cooker || false,
      grill: dbRecipe.grill || false,
    }
  };
};

export const getRecipeImageFallback = (type?: string): string => {
  if (!type) return '/images/recipe-placeholder.jpg';
  
  switch (type.toLowerCase()) {
    case 'breakfast':
      return '/images/breakfast.jpg';
    case 'lunch':
      return '/images/lunch.jpg';  
    case 'dinner':
      return '/images/dinner.jpg';
    case 'snack':
      return '/images/snack.jpg';
    case 'dessert':
      return '/images/dessert.jpg';
    default:
      return '/images/recipe-placeholder.jpg';
  }
};
