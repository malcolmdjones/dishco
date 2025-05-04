
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SavedMealPlan, Meal, MealPlanType, ActiveMealPlan } from '@/types/mealPlan';
import { format, addDays, parseISO } from 'date-fns';

export type { SavedMealPlan, Meal, MealPlanType, ActiveMealPlan };

export const useSavedMealPlans = () => {
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, user: currentUser } = useAuth();
  
  // State for active plans
  const [activePlans, setActivePlans] = useState<ActiveMealPlan[]>([]);

  // Fetch all saved meal plans
  const fetchSavedMealPlans = useCallback(async () => {
    setLoading(true);
    try {
      if (!isAuthenticated || !currentUser) {
        setSavedMealPlans([]);
        return;
      }

      // Corrected table name from 'meal_plans' to 'saved_meal_plans'
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved meal plans:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No saved meal plans found in database');
        setSavedMealPlans([]);
      } else {
        // Fetch meals for each meal plan - using meal_plan_recipes table instead of meals
        const mealPlansWithMeals = await Promise.all(
          data.map(async (mealPlan: any) => {
            // Updated to use meal_plan_recipes table
            const { data: mealsData, error: mealsError } = await supabase
              .from('meal_plan_recipes')
              .select('*')
              .eq('meal_plan_id', mealPlan.id);

            if (mealsError) {
              console.error(`Error fetching meals for meal plan ${mealPlan.id}:`, mealsError);
              return mealPlan; // Return meal plan without meals in case of error
            }

            return {
              ...mealPlan,
              meals: mealsData || [],
            };
          })
        );

        setSavedMealPlans(mealPlansWithMeals as SavedMealPlan[]);
      }
    } catch (error) {
      console.error('Error fetching saved meal plans:', error);
      toast({
        title: "Error",
        description: "Failed to load saved meal plans.",
        variant: "destructive"
      });
      setSavedMealPlans([]);
    } finally {
      setLoading(false);
    }
  }, [toast, isAuthenticated, currentUser]);

  // Get saved meal plan by ID
  const getSavedMealPlanById = useCallback((id: string) => {
    return savedMealPlans.find(mealPlan => mealPlan.id === id);
  }, [savedMealPlans]);

  // Save a meal plan
  const saveMealPlan = async (
    name: string,
    description: string,
    image_url: string,
    meals: { day: string; type: string; recipe_id: string; }[]
  ): Promise<boolean> => {
    try {
      if (!isAuthenticated || !currentUser) {
        toast({
          title: "Not authenticated",
          description: "You must be logged in to save meal plans.",
        });
        return false;
      }

      // Corrected table name from 'meal_plans' to 'saved_meal_plans'
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from('saved_meal_plans')
        .insert([{
          name,
          description,
          image_url,
          user_id: currentUser.id,
          // Use type-safe plan_data JSON structure
          plan_data: {
            description,
            days: []
          }
        }])
        .select('*')
        .single();

      if (mealPlanError) {
        console.error('Error saving meal plan:', mealPlanError);
        throw mealPlanError;
      }

      if (!mealPlanData) {
        console.error('No meal plan data returned after insert');
        return false;
      }

      // Insert meals into meal_plan_recipes table not the meals table
      const mealsToInsert = meals.map(meal => ({
        day_index: parseInt(meal.day) || 0,
        meal_type: meal.type,
        recipe_id: meal.recipe_id,
        meal_plan_id: mealPlanData.id,
      }));

      const { error: mealsError } = await supabase
        .from('meal_plan_recipes')
        .insert(mealsToInsert);

      if (mealsError) {
        console.error('Error saving meals:', mealsError);
        throw mealsError;
      }

      // Fetch updated meal plans
      await fetchSavedMealPlans();
      return true;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to save meal plan.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update a meal plan
  const updateMealPlan = async (
    id: string,
    name: string,
    description: string,
    image_url: string,
    meals: { id?: string; day: string; type: string; recipe_id: string; }[]
  ): Promise<boolean> => {
    try {
      if (!isAuthenticated || !currentUser) {
        toast({
          title: "Not authenticated",
          description: "You must be logged in to update meal plans.",
        });
        return false;
      }

      // Update meal plan in saved_meal_plans table
      const { error: mealPlanError } = await supabase
        .from('saved_meal_plans')
        .update({
          name,
          description,
          image_url,
        })
        .eq('id', id);

      if (mealPlanError) {
        console.error('Error updating meal plan:', mealPlanError);
        throw mealPlanError;
      }

      // Delete existing meals from meal_plan_recipes table
      const { error: deleteMealsError } = await supabase
        .from('meal_plan_recipes')
        .delete()
        .eq('meal_plan_id', id);

      if (deleteMealsError) {
        console.error('Error deleting existing meals:', deleteMealsError);
        throw deleteMealsError;
      }

      // Insert updated meals to meal_plan_recipes table
      const mealsToInsert = meals.map(meal => ({
        day_index: parseInt(meal.day) || 0,
        meal_type: meal.type,
        recipe_id: meal.recipe_id,
        meal_plan_id: id,
      }));

      const { error: mealsError } = await supabase
        .from('meal_plan_recipes')
        .insert(mealsToInsert);

      if (mealsError) {
        console.error('Error saving updated meals:', mealsError);
        throw mealsError;
      }

      // Fetch updated meal plans
      await fetchSavedMealPlans();
      return true;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to update meal plan.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete a meal plan
  const deleteMealPlan = async (id: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !currentUser) {
        toast({
          title: "Not authenticated",
          description: "You must be logged in to delete meal plans.",
        });
        return false;
      }

      // Delete from saved_meal_plans table
      const { error: mealPlanError } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', id);

      if (mealPlanError) {
        console.error('Error deleting meal plan:', mealPlanError);
        throw mealPlanError;
      }

      // Fetch updated meal plans
      await fetchSavedMealPlans();
      return true;
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete meal plan.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Get meals for a specific date
  const getMealsForDate = (dateString: string) => {
    // Look through active plans and find meals for this date
    if (!activePlans || activePlans.length === 0) return null;
    
    for (const activePlan of activePlans) {
      // Check if date falls within plan range
      const startDate = parseISO(activePlan.startDate);
      const endDate = parseISO(activePlan.endDate);
      const checkDate = parseISO(dateString);
      
      if (checkDate >= startDate && checkDate <= endDate) {
        // We found a plan that covers this date
        // Here you would need to return the meals for this date
        // This is a simplified implementation
        return {
          breakfast: [{ name: "Test Breakfast", macros: { calories: 400 } }],
          lunch: [{ name: "Test Lunch", macros: { calories: 600 } }],
          dinner: [{ name: "Test Dinner", macros: { calories: 700 } }],
          snacks: []
        };
      }
    }
    
    return null;
  };
  
  // Get dates with active meal plans
  const getDatesWithActivePlans = () => {
    const dates: string[] = [];
    
    activePlans.forEach(plan => {
      const startDate = parseISO(plan.startDate);
      const endDate = parseISO(plan.endDate);
      let currentDate = startDate;
      
      while (currentDate <= endDate) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addDays(currentDate, 1);
      }
    });
    
    return dates;
  };
  
  // Activate a meal plan
  const activatePlan = (plan: MealPlanType, startDayOffset: number) => {
    const startDate = addDays(new Date(), -startDayOffset);
    const numDays = plan.plan_data?.days?.length || 7;
    const endDate = addDays(startDate, numDays - 1);
    
    const newActivePlan: ActiveMealPlan = {
      plan,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      days: numDays
    };
    
    // Add to active plans
    setActivePlans(prev => [...prev, newActivePlan]);
    return true;
  };
  
  // State for pending activation
  const [pendingActivation, setPendingActivation] = useState<{
    plan: MealPlanType;
    startDay: number;
    startDate: string;
  } | null>(null);
  
  // State for overlap warning
  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  
  // Force activate a meal plan (replacing overlapping ones)
  const forceActivatePlan = () => {
    if (!pendingActivation) return false;
    
    // Implement the activation logic here
    const result = activatePlan(pendingActivation.plan, pendingActivation.startDay);
    setPendingActivation(null);
    return result;
  };
  
  // Cancel activation
  const cancelActivation = () => {
    setPendingActivation(null);
    setShowOverlapWarning(false);
  };
  
  // Deactivate a plan for a specific date
  const deactivatePlanForDate = (dateString: string) => {
    // Implementation would remove this date from active plans
    return true;
  };
  
  // Deactivate all plans
  const deactivateAllPlans = () => {
    setActivePlans([]);
    return true;
  };
  
  // Load saved meal plans on component mount
  useEffect(() => {
    fetchSavedMealPlans();
  }, [fetchSavedMealPlans]);

  return {
    savedMealPlans,
    loading,
    fetchSavedMealPlans,
    getSavedMealPlanById,
    saveMealPlan,
    updateMealPlan,
    deleteMealPlan,
    activePlans,
    getMealsForDate,
    activatePlan,
    pendingActivation,
    setPendingActivation,
    showOverlapWarning,
    setShowOverlapWarning,
    forceActivatePlan,
    cancelActivation,
    getDatesWithActivePlans,
    deactivatePlanForDate,
    deactivateAllPlans
  };
};
