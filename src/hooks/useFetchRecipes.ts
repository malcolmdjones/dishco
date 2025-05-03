
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { recipes as mockRecipes, Recipe } from '@/data/mockData';
import { DbRecipe, dbToFrontendRecipe } from '@/utils/recipeDbUtils';

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

  // Import mock recipes to database if they don't exist
  const importMockRecipesToDb = async () => {
    try {
      console.log("Checking for existing recipes in database...");
      // First, get all existing recipes from the database to check if we need to import
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('user_id, title');
      
      if (fetchError) {
        console.error('Error fetching existing recipes:', fetchError);
        throw fetchError;
      }
      
      // Create a map of existing recipe titles for quick lookup
      const existingRecipeTitles = new Set((existingRecipes || []).map(r => r.title?.toLowerCase()));
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

      // Insert the new recipes into the database one by one (to avoid batch insert errors)
      for (const recipe of recipesToImport) {
        // Convert frontend recipes to database format with proper types
        const dbRecipe = {
          title: recipe.name,
          short_description: recipe.description || '',
          type: recipe.type || 'meal',
          meal_prep: false,
          servings: recipe.servings || 1,
          prep_time: (recipe.prepTime || 0).toString(),
          cook_time: (recipe.cookTime || 0).toString(),
          total_time: ((recipe.prepTime || 0) + (recipe.cookTime || 0)).toString(),
          nutrition_calories: recipe.macros.calories || 0,
          nutrition_protein: recipe.macros.protein || 0,
          nutrition_carbs: recipe.macros.carbs || 0,
          nutrition_fat: recipe.macros.fat || 0,
          ingredients_json: recipe.ingredients || [],
          instructions_json: recipe.instructions || [],
          image_url: recipe.imageSrc || null,
          is_public: true,
          blender: recipe.requiresBlender || false,
          stovetop: true
        };
        
        const { error: insertError } = await supabase
          .from('recipes')
          .insert(dbRecipe);
        
        if (insertError) {
          console.error('Error importing recipe:', insertError);
        }
      }
      
      console.log(`Successfully imported recipes to the database`);
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
        .from('recipes')
        .select('*');

      if (error) {
        throw error;
      }

      if (!dbRecipes || dbRecipes.length === 0) {
        console.log('No recipes found in database even after import attempt, using mock recipes');
        setRecipes(mockRecipes);
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
  }, [isAuthenticated]);

  return {
    recipes,
    loading,
    isAuthenticated,
    fetchRecipes,
    filterRecipes,
    getRecipesByType
  };
};
