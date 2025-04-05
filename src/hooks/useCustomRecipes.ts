import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface CustomRecipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cookingTime: number;
  servings: number;
  createdAt: string;
  user_id?: string;
}

export const useCustomRecipes = () => {
  const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkAuthentication = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  };

  const migrateLegacyRecipes = async (isAuthenticated: boolean) => {
    try {
      if (!isAuthenticated) return [];
      
      const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
      if (savedRecipes.length === 0) return [];
      
      console.log(`Found ${savedRecipes.length} legacy recipes in localStorage`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: existingRecipes } = await supabase
        .from('custom_recipes')
        .select('title')
        .eq('user_id', user.id);
      
      const existingTitles = new Set((existingRecipes || []).map(r => r.title.toLowerCase()));
      
      const recipesToMigrate = savedRecipes.filter(
        (recipe: CustomRecipe) => !existingTitles.has(recipe.title.toLowerCase())
      );
      
      if (recipesToMigrate.length === 0) {
        console.log('All local recipes already exist in database');
        return savedRecipes;
      }
      
      const recipesToInsert = recipesToMigrate.map((recipe: CustomRecipe) => ({
        ...recipe,
        user_id: user.id
      }));
      
      const { error } = await supabase
        .from('custom_recipes')
        .insert(recipesToInsert);
      
      if (error) throw error;
      
      console.log(`Successfully migrated ${recipesToMigrate.length} recipes to Supabase`);
      
      localStorage.setItem('externalRecipes_backup', localStorage.getItem('externalRecipes') || '[]');
      
      return savedRecipes;
    } catch (error) {
      console.error('Error migrating legacy recipes:', error);
      return [];
    }
  };

  const fetchCustomRecipes = async () => {
    setIsLoading(true);
    try {
      const isAuthenticated = await checkAuthentication();
      
      if (!isAuthenticated) {
        const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
        setRecipes(savedRecipes);
        return;
      }
      
      await migrateLegacyRecipes(isAuthenticated);
      
      const { data, error } = await supabase
        .from('custom_recipes')
        .select('*');
      
      if (error) throw error;
      
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading custom recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load your custom recipes",
        variant: "destructive"
      });
      
      try {
        const savedRecipes = JSON.parse(localStorage.getItem('externalRecipes') || '[]');
        setRecipes(savedRecipes);
      } catch (e) {
        console.error('Error loading from localStorage fallback:', e);
        setRecipes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    try {
      const isAuthenticated = await checkAuthentication();
      
      if (isAuthenticated) {
        const { error } = await supabase
          .from('custom_recipes')
          .delete()
          .eq('id', recipeId);
        
        if (error) throw error;
      } else {
        const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
        localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
      }
      
      setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
      
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

  const addCustomRecipe = async (recipe: Omit<CustomRecipe, 'id' | 'createdAt' | 'user_id'>) => {
    try {
      const isAuthenticated = await checkAuthentication();
      
      const newRecipe = {
        ...recipe,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error } = await supabase
            .from('custom_recipes')
            .insert([{
              ...newRecipe,
              user_id: user.id
            }]);
          
          if (error) throw error;
        } else {
          const updatedRecipes = [...recipes, newRecipe];
          localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
        }
      } else {
        const updatedRecipes = [...recipes, newRecipe];
        localStorage.setItem('externalRecipes', JSON.stringify(updatedRecipes));
      }
      
      setRecipes(prev => [...prev, newRecipe]);
      
      toast({
        title: "Success",
        description: "Recipe added successfully",
      });
      
      return newRecipe.id;
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast({
        title: "Error",
        description: "Failed to add recipe",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchCustomRecipes();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCustomRecipes();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    recipes,
    isLoading,
    fetchCustomRecipes,
    deleteRecipe,
    addCustomRecipe
  };
};
