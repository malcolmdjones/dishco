
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecipePreference {
  recipe_id: string;
  user_id: string;
  liked: boolean;
  created_at?: string;
}

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
      
      const { data, error } = await supabase
        .from('recipe_preferences')
        .select('recipe_id, liked');

      if (error) throw error;

      if (data) {
        const liked = data.filter(pref => pref.liked).map(pref => pref.recipe_id);
        const disliked = data.filter(pref => !pref.liked).map(pref => pref.recipe_id);
        
        setLikedRecipeIds(liked);
        setDislikedRecipeIds(disliked);
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
      // Check if preference already exists
      const { data: existingPref } = await supabase
        .from('recipe_preferences')
        .select('*')
        .eq('recipe_id', recipeId)
        .single();

      if (existingPref) {
        // Update existing preference
        const { error } = await supabase
          .from('recipe_preferences')
          .update({ liked })
          .eq('recipe_id', recipeId);

        if (error) throw error;
      } else {
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
        
        // Insert new preference
        const { error } = await supabase
          .from('recipe_preferences')
          .insert([{ 
            recipe_id: recipeId,
            user_id: session.user.id,
            liked
          }]);

        if (error) throw error;
      }

      // Update local state
      if (liked) {
        setLikedRecipeIds(prev => [...prev, recipeId]);
        setDislikedRecipeIds(prev => prev.filter(id => id !== recipeId));
      } else {
        setDislikedRecipeIds(prev => [...prev, recipeId]);
        setLikedRecipeIds(prev => prev.filter(id => id !== recipeId));
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
      const { error } = await supabase
        .from('recipe_preferences')
        .delete()
        .eq('recipe_id', recipeId);

      if (error) throw error;
      
      // Update local state
      setLikedRecipeIds(prev => prev.filter(id => id !== recipeId));
      setDislikedRecipeIds(prev => prev.filter(id => id !== recipeId));
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
