
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Recipe } from '@/types/Recipe';

export interface MealPlan {
  id: string;
  name: string;
  created_at: string;
  user_id?: string;
  plan_data: {
    days: {
      date: string;
      meals: {
        breakfast?: Recipe | Recipe[] | null;
        lunch?: Recipe | Recipe[] | null;
        dinner?: Recipe | Recipe[] | null;
        snacks?: Recipe[] | null;
      };
    }[];
    description?: string;
  };
}

export const useSavedMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch meal plans from Supabase
  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        console.log(`Fetched ${data.length} meal plans`);
        // Convert JSON data to proper typed structure
        const typedPlans: MealPlan[] = data.map(item => ({
          id: item.id,
          name: item.name,
          created_at: item.created_at,
          user_id: item.user_id,
          plan_data: typeof item.plan_data === 'string' 
            ? JSON.parse(item.plan_data) 
            : item.plan_data
        }));
        setMealPlans(typedPlans);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: "Error",
        description: "Failed to load meal plans.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save a meal plan to Supabase
  const saveMealPlan = async (name: string, planData: any) => {
    try {
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .insert([
          { name, plan_data: planData }
        ])
        .select();

      if (error) throw error;

      if (data) {
        // Convert the newly saved plan to the right format
        const newPlan: MealPlan = {
          id: data[0].id,
          name: data[0].name,
          created_at: data[0].created_at,
          user_id: data[0].user_id,
          plan_data: typeof data[0].plan_data === 'string'
            ? JSON.parse(data[0].plan_data)
            : data[0].plan_data
        };
        
        setMealPlans(prevPlans => [newPlan, ...prevPlans]);
        toast({
          title: "Plan Saved",
          description: `"${name}" has been saved to your meal plans.`
        });
        return true;
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to save meal plan.",
        variant: "destructive"
      });
      return false;
    }
    return false;
  };

  // Delete a meal plan
  const deleteMealPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setMealPlans(mealPlans.filter(plan => plan.id !== planId));
      toast({
        title: "Plan Deleted",
        description: "Meal plan has been deleted."
      });
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

  // Fetch meal plans on mount
  useEffect(() => {
    fetchMealPlans();
  }, []);

  return { mealPlans, loading, fetchMealPlans, saveMealPlan, deleteMealPlan };
};
