
import { Recipe } from '@/types/Recipe';
import { supabase } from '@/integrations/supabase/client';
import { convertDbRecipeToFrontend } from '@/utils/recipeDbUtils';

export interface SearchResult {
  id: string;
  name: string;
  calories: number;
  servingInfo?: string;
  brand?: string;
  image?: string;
  source?: string;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  recipeId?: string;
}

export const searchFoods = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Search in the recipehub table
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipehub')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(20);

    if (recipeError) throw recipeError;

    // Convert to search results
    const results: SearchResult[] = (recipeData || []).map(recipe => ({
      id: `recipe-${recipe.id}`,
      name: recipe.title || 'Untitled Recipe',
      calories: recipe.nutrition_calories || 0,
      servingInfo: recipe.nutrition_serving || '1 serving',
      image: recipe.image_url,
      source: 'RecipeHub',
      macros: {
        protein: recipe.nutrition_protein,
        carbs: recipe.nutrition_carbs,
        fat: recipe.nutrition_fat
      },
      recipeId: recipe.id
    }));

    return results;
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};

export const getFoodDetails = async (foodId: string): Promise<Recipe | null> => {
  try {
    if (foodId.startsWith('recipe-')) {
      const recipeId = foodId.replace('recipe-', '');
      
      // Fetch the recipe from recipehub
      const { data, error } = await supabase
        .from('recipehub')
        .select('*')
        .eq('id', recipeId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return convertDbRecipeToFrontend(data);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting food details:', error);
    return null;
  }
};
