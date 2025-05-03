
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Recipe } from '@/types/Recipe';

export const useSavedRecipes = (recipes: Recipe[], isAuthenticated: boolean) => {
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user's saved recipe IDs from Supabase
  const fetchSavedRecipeIds = async () => {
    if (!isAuthenticated) {
      setSavedRecipeIds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id');

      if (error) {
        throw error;
      }

      if (data) {
        const ids = data.map(item => item.recipe_id);
        console.log(`Fetched ${ids.length} saved recipe IDs`);
        setSavedRecipeIds(ids);
      } else {
        setSavedRecipeIds([]);
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load saved recipes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if a recipe is saved
  const isRecipeSaved = (recipeId: string): boolean => {
    return savedRecipeIds.includes(recipeId);
  };

  // Toggle save/unsave recipe
  const toggleSaveRecipe = async (recipeId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save recipes.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isRecipeSaved(recipeId)) {
        // Remove from saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('recipe_id', recipeId);

        if (error) throw error;

        setSavedRecipeIds(prev => prev.filter(id => id !== recipeId));
        toast({
          title: "Recipe Removed",
          description: "Recipe removed from your saved recipes.",
        });
      } else {
        // Add to saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .insert([{ recipe_id: recipeId }]);

        if (error) throw error;

        setSavedRecipeIds(prev => [...prev, recipeId]);
        toast({
          title: "Recipe Saved",
          description: "Recipe added to your saved recipes.",
        });
      }
    } catch (error) {
      console.error('Error toggling recipe save:', error);
      toast({
        title: "Error",
        description: "Failed to update saved recipes.",
        variant: "destructive"
      });
    }
  };

  // Get all saved recipes
  const getSavedRecipes = (): Recipe[] => {
    return recipes.filter(recipe => isRecipeSaved(recipe.id));
  };

  // Fetch saved recipes on component mount
  useEffect(() => {
    fetchSavedRecipeIds();
  }, [isAuthenticated]);

  return {
    savedRecipeIds,
    isRecipeSaved,
    toggleSaveRecipe,
    getSavedRecipes,
    fetchSavedRecipeIds,
    loading
  };
};
