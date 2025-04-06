
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { recipes as mockRecipes, Recipe } from '@/data/mockData';
import { getRecipeImage } from '@/utils/recipeUtils';

// Update the DbRecipe interface to match the actual database schema
export interface DbRecipe {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  requires_cooking: boolean | null;
  prep_duration_days: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  total_time: string | null;
  price_range: string | null;
  calorie_bracket: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  ingredients_json: any | null;
  instructions_json: any | null;
  tags: string | null;
  meal_moods: string | null;
  protein_focus: string | null;
  cuisine: string | null;
  equipment_needed: string | null;
  dietary_tags: string | null;
  upc_ingredients: any | null;
  image_url: string | null;
  created_by: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
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

  return {
    id: dbRecipe.id,
    name: dbRecipe.name || '',
    description: dbRecipe.description || '',
    type: dbRecipe.type || 'meal',
    imageSrc: getRecipeImage(dbRecipe.image_url),
    requiresBlender: dbRecipe.equipment_needed?.includes('blender') || false,
    requiresCooking: dbRecipe.requires_cooking !== false, // Default to true if null
    cookTime: dbRecipe.cook_time || 0,
    prepTime: dbRecipe.prep_time || 0,
    servings: dbRecipe.servings || 1,
    macros: {
      calories: dbRecipe.calories || 0,
      protein: dbRecipe.protein || 0,
      carbs: dbRecipe.carbs || 0,
      fat: dbRecipe.fat || 0
    },
    ingredients,
    instructions
  };
};

// Convert frontend recipe to database format for insertion
const frontendToDbRecipe = (recipe: Recipe): Omit<DbRecipe, 'id' | 'created_at' | 'updated_at'> => {
  return {
    name: recipe.name,
    description: recipe.description || '',
    type: recipe.type || 'meal',
    requires_cooking: !recipe.requiresCooking,
    prep_duration_days: null,
    servings: recipe.servings || 1,
    prep_time: recipe.prepTime || 0,
    cook_time: recipe.cookTime || 0,
    total_time: ((recipe.prepTime || 0) + (recipe.cookTime || 0)).toString(),
    price_range: null,
    calorie_bracket: null,
    calories: recipe.macros.calories || 0,
    protein: recipe.macros.protein || 0,
    carbs: recipe.macros.carbs || 0,
    fat: recipe.macros.fat || 0,
    ingredients_json: recipe.ingredients || [],
    instructions_json: recipe.instructions || [],
    tags: null,
    meal_moods: null,
    protein_focus: null,
    cuisine: null,
    equipment_needed: recipe.requiresBlender ? 'blender' : null,
    dietary_tags: null,
    upc_ingredients: null,
    image_url: recipe.imageSrc || null,
    created_by: null,
    is_public: true,
    user_id: null
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
        .select('id, name');
      
      if (fetchError) throw fetchError;
      
      // Create a map of existing recipe titles for quick lookup
      const existingRecipeTitles = new Set(existingRecipes?.map(r => r.name?.toLowerCase()) || []);
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
        const frontendRecipes = dbRecipes.map(dbToFrontendRecipe);
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

  // Filter recipes by search term and other filters
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
