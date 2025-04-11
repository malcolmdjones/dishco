
import { useState, useCallback } from 'react';
import { Recipe } from '@/types/MealPlan';
import { useRecipes } from '@/hooks/useRecipes';

export const useRecipeVault = () => {
  const { recipes, isRecipeSaved, toggleSaveRecipe } = useRecipes();
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  // Get recipes by meal type
  const getRecipesByType = useCallback((mealType: string): Recipe[] => {
    if (!mealType) return recipes;
    
    // Convert meal type to recipe type format
    // Handle plural form of 'snacks' to singular 'snack'
    let type = mealType.toLowerCase();
    if (type === 'snacks') type = 'snack';
    
    return recipes.filter(recipe => recipe.type?.toLowerCase() === type);
  }, [recipes]);

  // Filter recipes by search term
  const filterRecipesByTerm = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredRecipes(recipes);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = recipes.filter(recipe => 
      recipe.name?.toLowerCase().includes(term) || 
      recipe.description?.toLowerCase().includes(term)
    );
    
    setFilteredRecipes(filtered);
  }, [recipes]);

  return {
    recipes,
    filteredRecipes,
    getRecipesByType,
    filterRecipesByTerm,
    isRecipeSaved,
    toggleSaveRecipe
  };
};
