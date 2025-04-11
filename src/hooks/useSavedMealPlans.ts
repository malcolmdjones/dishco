
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { dbToFrontendRecipe } from '@/utils/recipeDbUtils';
import { Recipe } from '@/data/mockData';
import { Json } from '@/integrations/supabase/types';

export type MealPlanData = {
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

export type MealPlan = {
  id: string;
  name: string;
  created_at: string;
  schema_version?: number;
  plan_data: MealPlanData;
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

  // Fetch meal plans and their recipes
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      // Only fetch plans if user is authenticated
      if (!user) {
        setPlans([]);
        setIsLoading(false);
        return;
      }

      // Fetch the meal plans
      const { data: plansData, error: plansError } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (plansError) throw plansError;
      if (!plansData) {
        setPlans([]);
        setIsLoading(false);
        return;
      }

      // Process each plan
      const processedPlans: MealPlan[] = [];
      
      for (const plan of plansData) {
        // For newer plans (schema_version >= 2), we'll fetch recipes from the junction table
        if (plan.schema_version && plan.schema_version >= 2) {
          // Fetch recipes for this plan using the database function
          const { data: recipesData, error: recipesError } = await supabase
            .rpc('get_meal_plan_recipes', { plan_id: plan.id });
            
          if (recipesError) {
            console.error('Error fetching plan recipes:', recipesError);
            // Add the plan with empty days as fallback
            processedPlans.push({
              ...plan,
              plan_data: { 
                days: [], 
                description: typeof plan.plan_data === 'object' ? plan.plan_data.description || '' : ''
              }
            });
            continue;
          }
          
          // Group recipes by day and meal type
          const dayMap = new Map();
          
          recipesData.forEach(recipeItem => {
            const { day_index, meal_type, recipe_data } = recipeItem;
            
            if (!dayMap.has(day_index)) {
              dayMap.set(day_index, {
                date: new Date(Date.now() + day_index * 24 * 60 * 60 * 1000).toISOString(),
                meals: { breakfast: null, lunch: null, dinner: null, snacks: [] }
              });
            }
            
            const day = dayMap.get(day_index);
            // Make sure recipe_data is an object before converting
            if (recipe_data && typeof recipe_data === 'object') {
              const recipe = dbToFrontendRecipe(recipe_data);
              
              // Add recipe to the appropriate meal slot
              if (meal_type === 'breakfast') {
                day.meals.breakfast = recipe;
              } else if (meal_type === 'lunch') {
                day.meals.lunch = recipe;
              } else if (meal_type === 'dinner') {
                day.meals.dinner = recipe;
              } else if (meal_type === 'snacks') {
                day.meals.snacks.push(recipe);
              }
            }
          });
          
          // Convert dayMap to array and sort by day index
          const daysArray = Array.from(dayMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([_, dayData]) => dayData);
            
          // Create the processed plan with proper typing
          processedPlans.push({
            id: plan.id,
            name: plan.name,
            created_at: plan.created_at,
            schema_version: plan.schema_version,
            user_id: plan.user_id,
            plan_data: {
              days: daysArray,
              description: typeof plan.plan_data === 'object' ? plan.plan_data.description || '' : '',
              tags: typeof plan.plan_data === 'object' && Array.isArray(plan.plan_data.tags) ? plan.plan_data.tags : []
            }
          });
        } else {
          // For legacy plans (schema_version < 2), ensure plan_data is properly typed
          const planData = typeof plan.plan_data === 'string' 
            ? JSON.parse(plan.plan_data) 
            : plan.plan_data;
            
          processedPlans.push({
            id: plan.id,
            name: plan.name,
            created_at: plan.created_at,
            schema_version: plan.schema_version,
            user_id: plan.user_id,
            plan_data: {
              days: planData.days || [],
              description: planData.description || '',
              tags: planData.tags || []
            }
          });
        }
      }
      
      setPlans(processedPlans);
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

  // Delete a meal plan
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
      // The junction table entries will be automatically deleted due to CASCADE
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

  // Save a new meal plan or update an existing one
  const saveMealPlan = async (plan: {
    id?: string;
    name: string;
    description?: string;
    days: Array<{
      date: string;
      meals: {
        breakfast?: Recipe | null;
        lunch?: Recipe | null;
        dinner?: Recipe | null;
        snacks?: Recipe[];
      };
    }>;
  }) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to save meal plans.",
          variant: "destructive"
        });
        return null;
      }
      
      // Create or update the meal plan entry
      const planData = {
        name: plan.name,
        user_id: user.id,
        plan_data: {
          description: plan.description || '',
          days: [] // We'll store just the minimal info in plan_data now
        },
        schema_version: 2 // Mark as new schema version
      };
      
      let planId = plan.id;
      
      if (plan.id) {
        // Update existing plan
        const { error: updateError } = await supabase
          .from('saved_meal_plans')
          .update(planData)
          .eq('id', plan.id)
          .eq('user_id', user.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new plan
        const { data: newPlan, error: createError } = await supabase
          .from('saved_meal_plans')
          .insert(planData)
          .select('id')
          .single();
          
        if (createError) throw createError;
        planId = newPlan.id;
      }
      
      if (!planId) throw new Error('Failed to get plan ID after save');
      
      // Delete existing recipes for this plan (for updates)
      if (plan.id) {
        const { error: deleteError } = await supabase
          .from('meal_plan_recipes')
          .delete()
          .eq('meal_plan_id', plan.id);
          
        if (deleteError) throw deleteError;
      }
      
      // Insert recipes for this meal plan
      const recipeEntries = [];
      
      plan.days.forEach((day, dayIndex) => {
        if (day.meals.breakfast) {
          recipeEntries.push({
            meal_plan_id: planId!,
            recipe_id: day.meals.breakfast.id,
            day_index: dayIndex,
            meal_type: 'breakfast',
            item_position: 0
          });
        }
        
        if (day.meals.lunch) {
          recipeEntries.push({
            meal_plan_id: planId!,
            recipe_id: day.meals.lunch.id,
            day_index: dayIndex,
            meal_type: 'lunch',
            item_position: 0
          });
        }
        
        if (day.meals.dinner) {
          recipeEntries.push({
            meal_plan_id: planId!,
            recipe_id: day.meals.dinner.id,
            day_index: dayIndex,
            meal_type: 'dinner',
            item_position: 0
          });
        }
        
        if (day.meals.snacks && day.meals.snacks.length > 0) {
          day.meals.snacks.forEach((snack, snackIndex) => {
            recipeEntries.push({
              meal_plan_id: planId!,
              recipe_id: snack.id,
              day_index: dayIndex,
              meal_type: 'snacks',
              item_position: snackIndex
            });
          });
        }
      });
      
      if (recipeEntries.length > 0) {
        const { error: recipeError } = await supabase
          .from('meal_plan_recipes')
          .insert(recipeEntries);
          
        if (recipeError) throw recipeError;
      }
      
      toast({
        title: plan.id ? "Plan Updated" : "Plan Saved",
        description: plan.id ? 
          "Your meal plan has been updated successfully." : 
          "Your meal plan has been saved successfully."
      });
      
      // Refresh plans list
      await fetchPlans();
      
      return planId;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to save your meal plan.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update plan metadata (name, description)
  const updatePlan = async (id: string, updates: { name?: string; description?: string }) => {
    try {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;
      
      // If it's a new schema plan, we just update the fields directly
      const updateData: any = {};
      
      if (updates.name) {
        updateData.name = updates.name;
      }
      
      if (updates.description !== undefined) {
        // Update plan_data.description
        updateData.plan_data = {
          ...plan.plan_data,
          description: updates.description
        };
      }
      
      const { error } = await supabase
        .from('saved_meal_plans')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
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
    updatePlan,
    viewPlanDetails,
    activePlan,
    activatePlan,
    deactivatePlan,
    copyAndEditPlan,
    getMealsForDate,
    saveMealPlan
  };
};
