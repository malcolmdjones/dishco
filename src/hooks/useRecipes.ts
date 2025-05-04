import { useFetchRecipes } from './useFetchRecipes';
import { useSavedRecipes } from './useSavedRecipes';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Change the re-export to use 'export type' syntax for TypeScript
export type { DbRecipe } from '@/utils/recipeDbUtils';
export { dbToFrontendRecipe, getRecipeImageFallback } from '@/utils/recipeDbUtils';
export { getRecipeImage, getTypeBasedImage } from '@/utils/recipeUtils';

export interface RecipeRating {
  recipe_id: string;
  avg_rating: number;
  rating_count: number;
}

export const useRecipes = () => {
  const { 
    recipes,
    loading,
    isAuthenticated,
    fetchRecipes,
    filterRecipes,
    getRecipesByType
  } = useFetchRecipes();

  const {
    savedRecipeIds,
    isRecipeSaved,
    toggleSaveRecipe,
    getSavedRecipes,
    fetchSavedRecipeIds
  } = useSavedRecipes(recipes, isAuthenticated);

  const [recipeRatings, setRecipeRatings] = useState<{
    recipe_id: string;
    avg_rating: number;
    rating_count: number;
  }[]>([]);

  const [ratingsLoading, setRatingsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch recipe ratings
  const fetchRecipeRatings = useCallback(async () => {
    try {
      // This is a custom PostgreSQL function that returns recipe ratings
      const { data, error } = await supabase
        .rpc('get_recipe_ratings');
        
      if (error) {
        console.error('Error fetching recipe ratings:', error);
        return;
      }
      
      setRecipeRatings(data || []);
    } catch (error) {
      console.error('Error in fetchRecipeRatings:', error);
    }
  }, [supabase]);

  // Get average rating for a recipe
  const getRecipeRating = (recipeId: string): { rating: number, count: number } => {
    const ratingData = recipeRatings.find(r => r.recipe_id === recipeId);
    return {
      rating: ratingData?.avg_rating || 0,
      count: ratingData?.rating_count || 0
    };
  };

  // Rate a recipe
  const rateRecipe = async (recipeId: string, rating: number, review?: string) => {
    try {
      if (!isAuthenticated || !user) {
        return false;
      }

      const { error } = await supabase
        .from('recipe_ratings')
        .upsert([{
          user_id: user.id,
          recipe_id: recipeId,
          rating,
          review: review || null
        }], { 
          onConflict: 'user_id,recipe_id' 
        });

      if (error) throw error;

      // Update ratings after rating
      fetchRecipeRatings();
      return true;
    } catch (error) {
      console.error('Error rating recipe:', error);
      return false;
    }
  };

  // Get user's rating for a recipe
  const getUserRecipeRating = async (recipeId: string) => {
    try {
      if (!isAuthenticated || !user) {
        return null;
      }

      const { data, error } = await supabase
        .from('recipe_ratings')
        .select('rating, review')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user recipe rating:', error);
      return null;
    }
  };

  // Load ratings when recipes change
  useEffect(() => {
    if (recipes.length > 0) {
      fetchRecipeRatings();
    }
  }, [recipes.length]);

  return {
    // Recipe data and state
    recipes,
    loading,
    isAuthenticated,
    
    // Recipe fetching and filtering
    fetchRecipes,
    filterRecipes,
    getRecipesByType,
    
    // Saved recipes functionality
    savedRecipeIds,
    isRecipeSaved,
    toggleSaveRecipe,
    getSavedRecipes,
    fetchSavedRecipeIds,

    // Recipe ratings
    recipeRatings,
    ratingsLoading,
    getRecipeRating,
    rateRecipe,
    getUserRecipeRating,
    fetchRecipeRatings
  };
};
