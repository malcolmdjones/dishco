import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type MealPlan = {
  id: string;
  name: string;
  created_at: string;
  plan_data: {
    days: Array<{
      date: string;
      meals: {
        breakfast?: any;
        lunch?: any;
        dinner?: any;
        snacks?: any[];
      };
    }>;
    description?: string;
    tags?: string[];
  };
  user_id?: string;
};

export const useSavedMealPlans = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isPlanDetailOpen, setIsPlanDetailOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<{plan: MealPlan, startDay: number} | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const storedActivePlan = sessionStorage.getItem('activePlan');
    if (storedActivePlan) {
      try {
        const parsedPlan = JSON.parse(storedActivePlan);
        // First check if this is one of our saved plans
        const matchingPlan = plans.find(p => 
          p.plan_data.days?.length === parsedPlan.days?.length && 
          JSON.stringify(p.plan_data.days) === JSON.stringify(parsedPlan.days)
        );
        
        if (matchingPlan) {
          setActivePlan({ 
            plan: matchingPlan, 
            startDay: parsedPlan.startDay || 0 
          });
        } else {
          // If not a saved plan, create a temporary plan object
          setActivePlan({ 
            plan: { 
              id: 'active', 
              name: 'Active Plan', 
              created_at: new Date().toISOString(),
              plan_data: parsedPlan
            },
            startDay: parsedPlan.startDay || 0
          });
        }
      } catch (error) {
        console.error('Error parsing active meal plan:', error);
        sessionStorage.removeItem('activePlan');
      }
    }
  }, [plans]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      // Only fetch plans if user is authenticated
      if (!user) {
        setPlans([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setPlans(data as MealPlan[]);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your saved meal plans.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    try {
      // Make sure we have a user
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to delete meal plans.",
          variant: "destructive"
        });
        return false;
      }

      console.log(`Attempting to delete plan with ID: ${id}`);
      
      // First verify if the plan exists
      const { data: existingPlan, error: fetchError } = await supabase
        .from('saved_meal_plans')
        .select('id, user_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching plan to delete:', fetchError);
        toast({
          title: "Error",
          description: "Cannot find the meal plan to delete.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Existing plan found:', existingPlan);
      
      // Verify ownership before deletion
      if (existingPlan.user_id !== user.id) {
        console.error('User does not own this plan');
        toast({
          title: "Permission Denied",
          description: "You can only delete your own meal plans.",
          variant: "destructive"
        });
        return false;
      }

      // If plan exists and belongs to user, proceed with deletion
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Deletion error:', error);
        throw error;
      }
      
      console.log('Plan deleted successfully from database');
      
      // Update local state to remove the deleted plan
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));
      
      // Close plan detail view if it was showing the deleted plan
      if (selectedPlan?.id === id) {
        setSelectedPlan(null);
        setIsPlanDetailOpen(false);
      }
      
      // Check if active plan is being deleted
      if (activePlan?.plan.id === id) {
        sessionStorage.removeItem('activePlan');
        setActivePlan(null);
        toast({
          title: "Active Plan Removed",
          description: "The deleted plan was your active plan and has been deactivated.",
        });
      }
      
      toast({
        title: "Plan Deleted",
        description: "Your meal plan has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete the meal plan.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updatePlan = async (id: string, updates: { name?: string; description?: string }) => {
    try {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;
      
      const updatedPlanData = {
        ...plan.plan_data,
        description: updates.description ?? plan.plan_data.description
      };

      const { error } = await supabase
        .from('saved_meal_plans')
        .update({
          name: updates.name ?? plan.name,
          plan_data: updatedPlanData
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setPlans(prevPlans => prevPlans.map(p => 
        p.id === id 
          ? { 
            ...p, 
            name: updates.name ?? p.name, 
            plan_data: {
              ...p.plan_data,
              description: updates.description ?? p.plan_data.description
            } 
          } 
          : p
      ));
      
      toast({
        title: "Success",
        description: "Meal plan updated successfully.",
      });
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to update the meal plan.",
        variant: "destructive"
      });
    }
  };

  const viewPlanDetails = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setIsPlanDetailOpen(true);
  };

  const activatePlan = (plan: MealPlan, startDay: number = 0) => {
    // Ensure we're storing the complete plan data with all recipe details
    sessionStorage.setItem('activePlan', JSON.stringify({
      ...plan.plan_data,
      startDay
    }));
    
    setActivePlan({ plan, startDay });
    
    toast({
      title: "Plan Activated",
      description: "This meal plan is now your active plan.",
    });
  };

  const deactivatePlan = () => {
    sessionStorage.removeItem('activePlan');
    setActivePlan(null);
    
    toast({
      title: "Plan Deactivated",
      description: "You no longer have an active meal plan.",
    });
  };

  const copyAndEditPlan = (plan: MealPlan) => {
    const lockedMeals: {[key: string]: boolean} = {};
    
    if (plan.plan_data.days) {
      plan.plan_data.days.forEach((day, dayIndex) => {
        if (day.meals) {
          if (day.meals.breakfast?.id) {
            lockedMeals[`breakfast-${day.meals.breakfast.id}`] = true;
          }
          
          if (day.meals.lunch?.id) {
            lockedMeals[`lunch-${day.meals.lunch.id}`] = true;
          }
          
          if (day.meals.dinner?.id) {
            lockedMeals[`dinner-${day.meals.dinner.id}`] = true;
          }
          
          if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
            day.meals.snacks.forEach((snack, snackIndex) => {
              if (snack?.id) {
                lockedMeals[`snacks-${snack.id}-${snackIndex}`] = true;
              }
            });
          }
        }
      });
    }
    
    sessionStorage.setItem('planToCopy', JSON.stringify(plan.plan_data));
    sessionStorage.setItem('lockedMeals', JSON.stringify(lockedMeals));
    
    toast({
      title: "Copy & Edit Mode",
      description: "You can now edit a copy of this meal plan.",
    });
  };

  const getMealsForDate = (dateString: string) => {
    if (!activePlan || !activePlan.plan.plan_data.days) {
      return null;
    }
    
    const targetDate = new Date(dateString);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - activePlan.startDay);
    
    const dayDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff >= 0 && dayDiff < activePlan.plan.plan_data.days.length) {
      const dayMeals = activePlan.plan.plan_data.days[dayDiff].meals;
      console.log('Found meals for day', dayDiff, dayMeals);
      return dayMeals;
    }
    
    return null;
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  return {
    plans,
    isLoading,
    selectedPlan,
    isPlanDetailOpen,
    setIsPlanDetailOpen,
    fetchPlans,
    deletePlan,
    updatePlan: hookUpdatePlan,
    viewPlanDetails,
    activePlan,
    activatePlan,
    deactivatePlan,
    copyAndEditPlan,
    getMealsForDate
  };
};
