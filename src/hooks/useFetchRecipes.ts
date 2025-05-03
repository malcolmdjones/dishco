
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RecipeHubDb, 
  recipeHubDbToFrontendRecipe, 
  sanitizeRecipeForInsert
} from '@/utils/recipeHubUtils';

export const useFetchRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

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

  // Load dietary restrictions
  useEffect(() => {
    const restrictions = getUserDietaryRestrictions();
    setDietaryRestrictions(restrictions);
  }, []);

  // Fetch all recipes exclusively from recipehub table
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      console.log("Fetching recipes exclusively from recipehub table...");
      
      // Clear existing recipes first to avoid showing old data
      setRecipes([]);
      
      // Fetch recipes only from the recipehub table
      const { data: dbRecipes, error } = await supabase
        .from('recipehub')
        .select('*');

      if (error) {
        throw error;
      }

      if (!dbRecipes || dbRecipes.length === 0) {
        console.log('No recipes found in recipehub database');
        setRecipes([]);
      } else {
        // Convert db recipes to frontend format
        const frontendRecipes = dbRecipes.map((recipe) => recipeHubDbToFrontendRecipe(recipe));
        console.log(`Fetched ${frontendRecipes.length} recipes from recipehub database`);
        console.log('Recipe types in database:', [...new Set(frontendRecipes.map(r => r.type))]);
        setRecipes(frontendRecipes);
      }
    } catch (error) {
      console.error('Error fetching recipes from recipehub:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes.",
        variant: "destructive"
      });
      // Set recipes to empty array to ensure no old data is shown
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter recipes by search query and other filters
  const filterRecipes = (
    searchQuery = '', 
    type = null,
    mealType = null,
  ) => {
    // First, filter by dietary restrictions
    let filteredRecipes = recipes;

    if (dietaryRestrictions.length > 0) {
      // Apply dietary restrictions filter
      filteredRecipes = filteredRecipes.filter(recipe => {
        for (const restriction of dietaryRestrictions) {
          // Apply filtering logic based on restrictions
          // This is a simplified version; the full implementation would analyze ingredients
          if (restriction === 'vegetarian' && recipe.name.toLowerCase().includes('meat')) {
            return false;
          }
          if (restriction === 'dairy-free' && recipe.name.toLowerCase().includes('cheese')) {
            return false;
          }
          // Add more restriction checks as needed
        }
        return true;
      });
    }

    // Then apply other filters
    return filteredRecipes.filter(recipe => {
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
  const getRecipesByType = (type) => {
    let filteredRecipes = recipes.filter(recipe => recipe.type?.toLowerCase() === type.toLowerCase());
    
    // Apply dietary restrictions
    if (dietaryRestrictions.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        // Apply dietary restrictions filtering logic (simplified for now)
        return !dietaryRestrictions.some(restriction => 
          (restriction === 'vegetarian' && recipe.name.toLowerCase().includes('meat')) ||
          (restriction === 'dairy-free' && recipe.name.toLowerCase().includes('cheese'))
        );
      });
    }
    
    return filteredRecipes;
  };

  // Load recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, [isAuthenticated]);

  return {
    recipes,
    loading,
    isAuthenticated,
    fetchRecipes,
    filterRecipes,
    getRecipesByType,
    dietaryRestrictions
  };
};

// Helper function from recipeHubUtils
import { getUserDietaryRestrictions } from '@/utils/recipeHubUtils';
