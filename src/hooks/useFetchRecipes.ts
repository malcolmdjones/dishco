
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { recipes as mockRecipes, Recipe } from '@/data/mockData';
import { RecipeHubDb, recipeHubDbToFrontendRecipe, frontendToRecipeHubDb, getUserDietaryRestrictions } from '@/utils/recipeHubUtils';

export const useFetchRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

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

  // Import mock recipes to database if they don't exist
  const importMockRecipesToDb = async () => {
    try {
      console.log("Checking for existing recipes in database...");
      // First, get all existing recipes from the database to check if we need to import
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipehub')
        .select('id, title');
      
      if (fetchError) throw fetchError;
      
      // Create a map of existing recipe titles for quick lookup
      const existingRecipeTitles = new Set(existingRecipes?.map(r => r.title?.toLowerCase()) || []);
      console.log(`Found ${existingRecipeTitles.size} existing recipes in database`);
      
      // Filter out mock recipes that already exist in the database (by name)
      const recipesToImport = mockRecipes.filter(
        recipe => !existingRecipeTitles.has(recipe.name.toLowerCase())
      );
      
      if (recipesToImport.length === 0) {
        console.log('All mock recipes already exist in the database');
        return;
      }

      console.log(`Importing ${recipesToImport.length} mock recipes to database...`);

      // Convert mock recipes to the database format
      const dbRecipesToInsert = recipesToImport.map(frontendToRecipeHubDb);
      
      // Insert the new recipes into the database
      const { error: insertError } = await supabase
        .from('recipehub')
        .insert(dbRecipesToInsert);
      
      if (insertError) throw insertError;
      
      console.log(`Successfully imported ${recipesToImport.length} mock recipes to the database`);
    } catch (error) {
      console.error('Error importing mock recipes to database:', error);
    }
  };

  // Fetch all recipes
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      // Import mock recipes to database first (if needed)
      await importMockRecipesToDb();

      // Then fetch all recipes from the database
      const { data: dbRecipes, error } = await supabase
        .from('recipehub')
        .select('*');

      if (error) {
        throw error;
      }

      if (!dbRecipes || dbRecipes.length === 0) {
        console.log('No recipes found in database even after import attempt, using mock recipes');
        setRecipes(mockRecipes);
      } else {
        // Convert db recipes to frontend format
        const frontendRecipes = dbRecipes.map((recipe: any) => recipeHubDbToFrontendRecipe(recipe as RecipeHubDb));
        console.log(`Fetched ${frontendRecipes.length} recipes from database`);
        console.log('Recipe types in database:', [...new Set(frontendRecipes.map(r => r.type))]);
        setRecipes(frontendRecipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes. Using mock recipes instead.",
        variant: "destructive"
      });
      setRecipes(mockRecipes);
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
  const getRecipesByType = (type: string): Recipe[] => {
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
