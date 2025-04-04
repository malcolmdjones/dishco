
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [planCount, setMealPlanCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  
  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please sign in to access the admin panel.",
            variant: "destructive"
          });
          return false;
        }
        
        // Check admin status
        const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { 
          user_id: session.user.id 
        } as { user_id: string });
          
        if (adminCheckError || !isAdmin) {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive"
          });
          return false;
        }
        
        setIsAdminUser(true);
        
        // Fetch dashboard stats
        await fetchDashboardStats();
        return true;
        
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Error",
          description: "Failed to verify admin privileges",
          variant: "destructive"
        });
        return false;
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAndFetchStats();
  }, [toast]);
  
  const fetchDashboardStats = async () => {
    try {
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (!userError) {
        setUserCount(userCount || 0);
      }
      
      // Get meal plan count
      const { count: planCount, error: planError } = await supabase
        .from('saved_meal_plans')
        .select('*', { count: 'exact', head: true });
        
      if (!planError) {
        setMealPlanCount(planCount || 0);
      }
      
      // Get recipe count
      const { count: recipeCount, error: recipeError } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });
        
      if (!recipeError) {
        setRecipeCount(recipeCount || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };
  
  return {
    loading,
    isAdminUser,
    userCount,
    planCount,
    recipeCount
  };
};
