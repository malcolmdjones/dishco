
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useRecipePreferences = () => {
  const [likedRecipeIds, setLikedRecipeIds] = useState<string[]>([]);
  const [dislikedRecipeIds, setDislikedRecipeIds] = useState<string[]>([]);
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

  // Fetch user's recipe preferences
  const fetchPreferences = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // We'll use saved_recipes table instead of recipe_preferences
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*');

      if (error) throw error;

      if (data) {
        // For now, we'll treat all saved recipes as liked recipes
        // In a real application, you might want to add a 'liked' field to the saved_recipes table
        const savedRecipeIds = data.map(item => item.recipe_id);
        
        setLikedRecipeIds(savedRecipeIds);
      }
    } catch (error) {
      console.error('Error fetching recipe preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set preference (like or dislike)
  const setRecipePreference = async (recipeId: string, liked: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to save preferences.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to save preferences.",
          variant: "destructive"
        });
        return;
      }

      if (liked) {
        // If recipe is liked, save it
        const { error } = await supabase
          .from('saved_recipes')
          .insert({ 
            recipe_id: recipeId,
            user_id: session.user.id
          });

        if (error && error.code !== '23505') { // Ignore duplicate key violations
          throw error;
        }

        // Update local state to include the liked recipe
        setLikedRecipeIds(prev => [...prev, recipeId]);
      } else {
        // If recipe is disliked, remove it from saved_recipes if it exists
        await removePreference(recipeId);
        
        // Add to disliked recipes in local state
        setDislikedRecipeIds(prev => [...prev, recipeId]);
      }
    } catch (error) {
      console.error('Error setting recipe preference:', error);
      toast({
        title: "Error",
        description: "Failed to save your preference.",
        variant: "destructive"
      });
    }
  };

  // Check if a recipe is liked
  const isRecipeLiked = (recipeId: string) => {
    return likedRecipeIds.includes(recipeId);
  };

  // Check if a recipe is disliked
  const isRecipeDisliked = (recipeId: string) => {
    return dislikedRecipeIds.includes(recipeId);
  };

  // Remove preference
  const removePreference = async (recipeId: string) => {
    if (!isAuthenticated) return;

    try {
      // Remove from saved_recipes table
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('recipe_id', recipeId);

      if (error) throw error;
      
      // Update local state
      setLikedRecipeIds(prev => prev.filter(id => id !== recipeId));
    } catch (error) {
      console.error('Error removing recipe preference:', error);
    }
  };

  // Load preferences on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    }
  }, [isAuthenticated]);

  return {
    likedRecipeIds,
    dislikedRecipeIds,
    loading,
    isRecipeLiked,
    isRecipeDisliked,
    setRecipePreference,
    removePreference,
    fetchPreferences
  };
};
