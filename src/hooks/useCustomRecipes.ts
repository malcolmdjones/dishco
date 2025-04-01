
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CustomRecipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cookingTime: number;
  servings: number;
  createdAt: string;
}

export const useCustomRecipes = () => {
  const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomRecipes = () => {
    setIsLoading(true);
    try {
      // Load from localStorage for now
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      setRecipes(savedRecipes);
    } catch (error) {
      console.error('Error loading custom recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load your custom recipes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecipe = (recipeId: string) => {
    try {
      const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
      localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
      setRecipes(updatedRecipes);
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCustomRecipes();
  }, []);

  return {
    recipes,
    isLoading,
    fetchCustomRecipes,
    deleteRecipe
  };
};
