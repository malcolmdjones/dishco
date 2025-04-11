
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MealPlan } from '@/types/MealPlan';
import { format } from 'date-fns';

export const useSavedMealPlans = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isPlanDetailOpen, setIsPlanDetailOpen] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();

    // Check for active meal plan in session storage
    const storedActivePlan = sessionStorage.getItem('activatePlanData');
    if (storedActivePlan) {
      try {
        setActivePlan(JSON.parse(storedActivePlan));
      } catch (error) {
        console.error('Error parsing active plan data:', error);
      }
    }
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to ensure it matches our MealPlan type
      const transformedPlans: MealPlan[] = data?.map(plan => ({
        ...plan,
        plan_data: typeof plan.plan_data === 'string' 
          ? JSON.parse(plan.plan_data) 
          : plan.plan_data
      })) || [];

      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: "Failed to load meal plans",
        description: "There was an error loading your saved meal plans.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        throw error;
      }

      // Update the local state
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      toast({
        title: "Plan deleted",
        description: "Your meal plan has been successfully deleted.",
      });
      
      // Close detail view if the deleted plan was being viewed
      if (selectedPlan && selectedPlan.id === planId) {
        setIsPlanDetailOpen(false);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete the meal plan.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updatePlan = async (planId: string, updates: { name?: string; description?: string }) => {
    try {
      // Prepare the update payload
      const updatePayload: { name?: string; plan_data?: any } = {};
      if (updates.name) {
        updatePayload.name = updates.name;
      }
      
      // If there's a description update, we need to update the plan_data
      if (updates.description !== undefined) {
        // Find the current plan to get its plan_data
        const currentPlan = plans.find(p => p.id === planId);
        if (currentPlan) {
          const updatedPlanData = {
            ...(currentPlan.plan_data || {}),
            description: updates.description
          };
          updatePayload.plan_data = updatedPlanData;
        }
      }
      
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .update(updatePayload)
        .eq('id', planId)
        .select();

      if (error) {
        throw error;
      }

      // Update the local state
      setPlans(prevPlans => prevPlans.map(plan => 
        plan.id === planId ? { 
          ...plan, 
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.description !== undefined ? { 
            plan_data: {
              ...plan.plan_data,
              description: updates.description
            }
          } : {})
        } : plan
      ));
      
      // If the selected plan was updated, update it too
      if (selectedPlan && selectedPlan.id === planId) {
        const updatedPlan = plans.find(p => p.id === planId);
        if (updatedPlan) {
          setSelectedPlan({
            ...updatedPlan,
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.description !== undefined ? { 
              plan_data: {
                ...updatedPlan.plan_data,
                description: updates.description
              }
            } : {})
          });
        }
      }
      
      toast({
        title: "Plan updated",
        description: "Your meal plan has been successfully updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update the meal plan.",
        variant: "destructive"
      });
      return false;
    }
  };

  const viewPlanDetails = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setIsPlanDetailOpen(true);
  };

  const activatePlan = (plan: MealPlan, startDay: number) => {
    // Save the plan to session storage
    sessionStorage.setItem('activatePlanData', JSON.stringify(plan));
    sessionStorage.setItem('activatePlanDate', format(new Date(), 'yyyy-MM-dd'));
    sessionStorage.setItem('activatePlanStartDay', String(startDay));
    
    setActivePlan(plan);
    
    toast({
      title: "Plan Activated",
      description: `${plan.name} has been set as your active meal plan.`,
    });
  };

  const copyAndEditPlan = (plan: MealPlan) => {
    sessionStorage.setItem('planToCopy', JSON.stringify(plan));
    return true;
  };

  const getMealsForDate = (dateString: string) => {
    if (!activePlan || !activePlan.plan_data || !activePlan.plan_data.days) {
      return null;
    }

    const day = activePlan.plan_data.days.find(d => d.date === dateString);
    if (!day) {
      return null;
    }

    return day.meals;
  };

  return {
    plans,
    isLoading,
    selectedPlan,
    setSelectedPlan,
    isPlanDetailOpen,
    setIsPlanDetailOpen,
    deletePlan,
    updatePlan,
    viewPlanDetails,
    fetchPlans,
    activePlan,
    getMealsForDate,
    activatePlan,
    copyAndEditPlan
  };
};
