
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DbRecipe, dbToFrontendRecipe } from '@/utils/recipeDbUtils';
import { Recipe } from '@/data/mockData';

export const useFetchRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch all recipes
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      // Get all recipes from the database
      const { data: dbRecipes, error } = await supabase
        .from('recipes')
        .select('*');

      if (error) {
        console.error('Error fetching recipes:', error);
        throw error;
      }

      if (!dbRecipes || dbRecipes.length === 0) {
        console.log('No recipes found in database');
        setRecipes([]);
      } else {
        // Convert db recipes to frontend format
        const frontendRecipes = dbRecipes.map((recipe: any) => dbToFrontendRecipe(recipe as DbRecipe));
        console.log(`Fetched ${frontendRecipes.length} recipes from database`);
        console.log('Recipe types in database:', [...new Set(frontendRecipes.map(r => r.type))]);
        setRecipes(frontendRecipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes.",
        variant: "destructive"
      });
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter recipes by search query and other filters
  const filterRecipes = (
    searchQuery: string = '', 
    type: string | null = null,
    mealType: string | null = null,
  ): Recipe[] => {
    return recipes.filter(recipe => {
      // Match search query
      const matchesSearch = !searchQuery || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase()?.includes(searchQuery.toLowerCase());
      
      // Match recipe type
      const matchesType = !type || type === 'all' || recipe.type?.toLowerCase() === type?.toLowerCase();
      
      // Match meal type
      const matchesMealType = !mealType || recipe.type?.toLowerCase() === mealType?.toLowerCase();
      
      return matchesSearch && matchesType && matchesMealType;
    });
  };

  // Get recipes by type (e.g., 'snack', 'breakfast', etc.)
  const getRecipesByType = (type: string): Recipe[] => {
    return recipes.filter(recipe => recipe.type?.toLowerCase() === type.toLowerCase());
  };

  // Load recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes,
    loading,
    isAuthenticated,
    fetchRecipes,
    filterRecipes,
    getRecipesByType
  };
};
