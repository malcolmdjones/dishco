
import { useFetchRecipes } from './useFetchRecipes';
import { useSavedRecipes } from './useSavedRecipes';

// Add DbRecipe interface for the database recipe structure
export interface DbRecipe {
  id: string;
  title?: string;
  short_description?: string;
  type?: string;
  image_url?: string;
  is_public?: boolean;
  nutrition_calories?: number;
  nutrition_protein?: number;
  nutrition_carbs?: number;
  nutrition_fat?: number;
  created_at?: string;
}

// Change the re-export to use 'export type' since we're re-exporting types
export type { RecipeHubDb } from '@/utils/recipeHubUtils';
export { recipeHubDbToFrontendRecipe, filterRecipesByDietaryRestrictions, getUserDietaryRestrictions } from '@/utils/recipeHubUtils';

export const useRecipes = () => {
  const { 
    recipes,
    loading,
    isAuthenticated,
    fetchRecipes,
    filterRecipes,
    getRecipesByType,
    dietaryRestrictions
  } = useFetchRecipes();

  const {
    savedRecipeIds,
    isRecipeSaved,
    toggleSaveRecipe,
    getSavedRecipes,
    fetchSavedRecipeIds
  } = useSavedRecipes(recipes, isAuthenticated);

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
    
    // Dietary restrictions
    dietaryRestrictions
  };
};
