import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SavedMealPlan {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  meals: Meal[];
  created_at?: string;
}

export interface Meal {
  id: string;
  day: string;
  type: string;
  recipe_id: string;
}

export const useSavedMealPlans = () => {
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, user: currentUser } = useAuth();

  // Fetch all saved meal plans
  const fetchSavedMealPlans = useCallback(async () => {
    setLoading(true);
    try {
      if (!isAuthenticated || !currentUser) {
        setSavedMealPlans([]);
        return;
      }

      const { data, error } = await supabase
        .from('meal_plans')
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
        // Fetch meals for each meal plan
        const mealPlansWithMeals = await Promise.all(
          data.map(async (mealPlan: any) => {
            const { data: mealsData, error: mealsError } = await supabase
              .from('meals')
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

      // Insert meal plan
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert([{
          name,
          description,
          image_url,
          user_id: currentUser.id,
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

      // Insert meals
      const mealsToInsert = meals.map(meal => ({
        ...meal,
        meal_plan_id: mealPlanData.id,
      }));

      const { error: mealsError } = await supabase
        .from('meals')
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

      // Update meal plan
      const { error: mealPlanError } = await supabase
        .from('meal_plans')
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

      // Delete existing meals
      const { error: deleteMealsError } = await supabase
        .from('meals')
        .delete()
        .eq('meal_plan_id', id);

      if (deleteMealsError) {
        console.error('Error deleting existing meals:', deleteMealsError);
        throw deleteMealsError;
      }

      // Insert updated meals
      const mealsToInsert = meals.map(meal => ({
        day: meal.day,
        type: meal.type,
        recipe_id: meal.recipe_id,
        meal_plan_id: id,
      }));

      const { error: mealsError } = await supabase
        .from('meals')
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

      // Delete meal plan
      const { error: mealPlanError } = await supabase
        .from('meal_plans')
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
    deleteMealPlan
  };
};
