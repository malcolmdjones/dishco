
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { recipes as mockRecipes, Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';

// Update the DbRecipe interface to match the actual database schema for the 'recipes' table
export interface DbRecipe {
  id: string;
  title: string | null;
  short_description: string | null;
  type: string | null;
  meal_prep: boolean | null;
  prep_duration_days: string | null;
  servings: number | null;
  prep_time: string | null;
  cook_time: string | null;
  total_time: string | null;
  price_range: string | null;
  calorie_bracket: string | null;
  nutrition_calories: number | null;
  nutrition_protein: number | null;
  nutrition_carbs: number | null;
  nutrition_fat: number | null;
  ingredients_json: any | null;
  instructions_json: any | null;
  tags: string | null;
  protein_focus: string | null;
  cuisine: string | null;
  dietary_tags: string | null;
  upc_ingredients: any | null;
  image_url: string | null;
  created_by: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  oven: boolean | null;
  stovetop: boolean | null;
  air_fryer: boolean | null;
  blender: boolean | null;
  grill: boolean | null;
  slow_cooker: boolean | null;
}

// Convert database recipe to frontend recipe format
export const dbToFrontendRecipe = (dbRecipe: DbRecipe): Recipe => {
  // Parse ingredients and instructions from JSON if available
  const ingredients = dbRecipe.ingredients_json ? 
    Array.isArray(dbRecipe.ingredients_json) ? 
    dbRecipe.ingredients_json : [] : [];
  
  const instructions = dbRecipe.instructions_json ? 
    Array.isArray(dbRecipe.instructions_json) ? 
    dbRecipe.instructions_json : [] : [];

  // Calculate cooking time in minutes (if it's a string, try to convert or default to 0)
  const cookTimeNum = dbRecipe.cook_time ? 
    (typeof dbRecipe.cook_time === 'string' ? 
      parseInt(dbRecipe.cook_time, 10) || 0 : dbRecipe.cook_time) : 0;

  // Calculate prep time in minutes (if it's a string, try to convert or default to 0)
  const prepTimeNum = dbRecipe.prep_time ? 
    (typeof dbRecipe.prep_time === 'string' ? 
      parseInt(dbRecipe.prep_time, 10) || 0 : dbRecipe.prep_time) : 0;

  return {
    id: dbRecipe.id,
    name: dbRecipe.title || '',
    description: dbRecipe.short_description || '',
    type: dbRecipe.type || 'meal',
    imageSrc: getRecipeImage(dbRecipe.image_url),
    requiresBlender: dbRecipe.blender || false,
    requiresCooking: true, // Default to true as most recipes require cooking
    cookTime: cookTimeNum,
    prepTime: prepTimeNum,
    servings: dbRecipe.servings || 1,
    macros: {
      calories: dbRecipe.nutrition_calories || 0,
      protein: dbRecipe.nutrition_protein || 0,
      carbs: dbRecipe.nutrition_carbs || 0,
      fat: dbRecipe.nutrition_fat || 0
    },
    ingredients,
    instructions
  };
};

// Convert frontend recipe to database format for insertion
const frontendToDbRecipe = (recipe: Recipe): Partial<DbRecipe> => {
  return {
    title: recipe.name,
    short_description: recipe.description || '',
    type: recipe.type || 'meal',
    meal_prep: false,
    prep_duration_days: null,
    servings: recipe.servings || 1,
    prep_time: recipe.prepTime?.toString() || '0',
    cook_time: recipe.cookTime?.toString() || '0',
    total_time: ((recipe.prepTime || 0) + (recipe.cookTime || 0)).toString(),
    nutrition_calories: recipe.macros.calories || 0,
    nutrition_protein: recipe.macros.protein || 0,
    nutrition_carbs: recipe.macros.carbs || 0,
    nutrition_fat: recipe.macros.fat || 0,
    ingredients_json: recipe.ingredients || [],
    instructions_json: recipe.instructions || [],
    tags: null,
    protein_focus: null,
    cuisine: null,
    dietary_tags: null,
    upc_ingredients: null,
    image_url: recipe.imageSrc || null,
    created_by: null,
    is_public: true,
    blender: recipe.requiresBlender || false,
    stovetop: true // Assuming most recipes use stovetop by default
  };
};

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
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
      const dbRecipesToInsert = recipesToImport.map(frontendToDbRecipe);
      
      // Insert the new recipes into the database
      const { error: insertError } = await supabase
        .from('recipes')
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
        .from('recipes')
        .select('*');

      if (error) {
        throw error;
      }

      if (!dbRecipes || dbRecipes.length === 0) {
        console.log('No recipes found in database even after import attempt');
        setRecipes([]);
      } else {
        // Convert db recipes to frontend format
        const frontendRecipes = dbRecipes.map((recipe: any) => dbToFrontendRecipe(recipe as DbRecipe));
        setRecipes(frontendRecipes);
      }

      // Fetch saved recipe IDs
      fetchSavedRecipeIds();
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

  // Fetch saved recipe IDs for the current user
  const fetchSavedRecipeIds = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        setSavedRecipeIds([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe_id');

      if (error) {
        throw error;
      }

      if (data) {
        setSavedRecipeIds(data.map(item => item.recipe_id));
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      setSavedRecipeIds([]);
    }
  };

  // Check if a recipe is saved
  const isRecipeSaved = (recipeId: string) => {
    return savedRecipeIds.includes(recipeId);
  };

  // Save or unsave a recipe
  const toggleSaveRecipe = async (recipeId: string) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to save recipes.",
          variant: "destructive"
        });
        return;
      }
      
      if (isRecipeSaved(recipeId)) {
        // Unsave the recipe
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('recipe_id', recipeId);

        if (error) throw error;
        
        setSavedRecipeIds(prev => prev.filter(id => id !== recipeId));
        
        toast({
          title: "Recipe Unsaved",
          description: "Recipe removed from your saved recipes.",
        });
      } else {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "You need to be logged in to save recipes.",
            variant: "destructive"
          });
          return;
        }
        
        // Save the recipe with user_id
        const { error } = await supabase
          .from('saved_recipes')
          .insert([{ 
            recipe_id: recipeId,
            user_id: session.user.id
          }]);

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
        description: "Failed to save/unsave recipe.",
        variant: "destructive"
      });
    }
  };

  // Get recipes by type (e.g., 'snack', 'breakfast', etc.)
  const getRecipesByType = (type: string): Recipe[] => {
    return recipes.filter(recipe => recipe.type === type);
  };

  // Get saved recipes
  const getSavedRecipes = (): Recipe[] => {
    return recipes.filter(recipe => isRecipeSaved(recipe.id));
  };

  // Filter recipes by search query and other filters
  const filterRecipes = (
    searchQuery: string = '', 
    type: string | null = null,
    mealType: string | null = null,
    // Add other filter parameters as needed
  ): Recipe[] => {
    return recipes.filter(recipe => {
      // Match search query
      const matchesSearch = !searchQuery || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Match recipe type
      const matchesType = !type || type === 'all' || recipe.type === type;
      
      // Match meal type
      const matchesMealType = !mealType || recipe.type === mealType;
      
      return matchesSearch && matchesType && matchesMealType;
    });
  };

  // Load recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, [isAuthenticated]);

  // Refresh saved recipes when auth state changes
  useEffect(() => {
    fetchSavedRecipeIds();
  }, [isAuthenticated]);

  return {
    recipes,
    savedRecipeIds,
    loading,
    isAuthenticated,
    isRecipeSaved,
    toggleSaveRecipe,
    fetchRecipes,
    getRecipesByType,
    getSavedRecipes,
    filterRecipes
  };
};
