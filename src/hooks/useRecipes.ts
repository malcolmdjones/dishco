
import { useFetchRecipes } from './useFetchRecipes';
import { useSavedRecipes } from './useSavedRecipes';

export { DbRecipe, dbToFrontendRecipe } from '@/utils/recipeDbUtils';

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
    fetchSavedRecipeIds
  };
};
