
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  member_since: string | null;
  rank_number: number | null;
  followers_count: number | null;
  following_count: number | null;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  content: string | null;
  recipe_id: string | null;
  related_user_id: string | null;
  created_at: string;
}

export const useUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user profile
  const fetchUserProfile = async (userId?: string) => {
    setLoading(true);
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setProfile(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code !== 'PGRST116') { // Not found error
          throw error;
        }
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user?.id) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      // Refresh profile data
      fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Check if username exists
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found error
          return false;
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  // Fetch user activities
  const fetchUserActivities = async (userId?: string) => {
    setActivityLoading(true);
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setActivities([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(data as UserActivity[]);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // Record a user activity
  const recordActivity = async (
    activityType: string, 
    content?: string,
    recipeId?: string,
    relatedUserId?: string
  ) => {
    try {
      if (!isAuthenticated || !user?.id) {
        console.log('User not authenticated, activity not recorded');
        return;
      }

      const activity = {
        user_id: user.id,
        activity_type: activityType,
        content: content || null,
        recipe_id: recipeId || null,
        related_user_id: relatedUserId || null
      };

      const { error } = await supabase
        .from('user_activities')
        .insert([activity]);

      if (error) throw error;
      
      // Refresh activities after adding a new one
      fetchUserActivities();
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  // Follow a user
  const followUser = async (targetUserId: string) => {
    try {
      if (!isAuthenticated || !user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to follow users."
        });
        return false;
      }

      if (user.id === targetUserId) {
        toast({
          title: "Error",
          description: "You cannot follow yourself.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('user_follows')
        .insert([{
          follower_id: user.id,
          following_id: targetUserId
        }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Already following",
            description: "You are already following this user."
          });
        } else {
          throw error;
        }
        return false;
      }

      // Record the activity
      await recordActivity('follow', null, null, targetUserId);

      toast({
        title: "Success",
        description: "You are now following this user."
      });
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Unfollow a user
  const unfollowUser = async (targetUserId: string) => {
    try {
      if (!isAuthenticated || !user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to unfollow users."
        });
        return false;
      }

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have unfollowed this user."
      });
      
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Check if following a user
  const isFollowing = async (targetUserId: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !user?.id) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found error
          return false;
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  // Rate a recipe
  const rateRecipe = async (recipeId: string, rating: number, review?: string) => {
    try {
      if (!isAuthenticated || !user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to rate recipes."
        });
        return false;
      }

      if (rating < 1 || rating > 10) {
        toast({
          title: "Invalid rating",
          description: "Rating must be between 1 and 10."
        });
        return false;
      }

      // Check if user has already rated this recipe
      const { data: existingRating, error: fetchError } = await supabase
        .from('recipe_ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let error;
      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('recipe_ratings')
          .update({ rating, review: review || null })
          .eq('id', existingRating.id);
        
        error = updateError;
      } else {
        // Create new rating
        const { error: insertError } = await supabase
          .from('recipe_ratings')
          .insert([{
            user_id: user.id,
            recipe_id: recipeId,
            rating,
            review: review || null
          }]);
        
        error = insertError;
      }

      if (error) throw error;

      // Record the activity
      const activityType = existingRating ? 'update_rating' : 'rate_recipe';
      await recordActivity(
        activityType, 
        `Rated a recipe ${rating}/10${review ? ': ' + review : ''}`,
        recipeId
      );

      toast({
        title: "Success",
        description: existingRating ? "Rating updated" : "Recipe rated successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error rating recipe:', error);
      toast({
        title: "Error",
        description: "Failed to rate recipe.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get user's rating for a recipe
  const getUserRating = async (recipeId: string) => {
    try {
      if (!isAuthenticated || !user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from('recipe_ratings')
        .select('rating, review')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found error
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return null;
    }
  };

  // Fetch user profile when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
      fetchUserActivities();
    } else {
      setProfile(null);
      setActivities([]);
    }
  }, [isAuthenticated, user?.id]);

  return {
    profile,
    activities,
    loading,
    activityLoading,
    fetchUserProfile,
    updateUserProfile,
    checkUsernameExists,
    fetchUserActivities,
    recordActivity,
    followUser,
    unfollowUser,
    isFollowing,
    rateRecipe,
    getUserRating
  };
};
