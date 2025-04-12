
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDescription, getTags, jsonToDbRecipe } from '@/utils/mealPlanUtils';
import { dbToFrontendRecipe } from '@/utils/recipeDbUtils';
import { MealPlan } from '@/types/mealPlanTypes';
import { Recipe } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanApiOperations = (user: any) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchPlans = async (): Promise<MealPlan[]> => {
    setIsLoading(true);
    try {
      if (!user) {
        setIsLoading(false);
        return [];
      }

      const { data: plansData, error: plansError } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (plansError) throw plansError;
      if (!plansData) {
        setIsLoading(false);
        return [];
      }

      const processedPlans: MealPlan[] = [];
      
      for (const plan of plansData) {
        if (plan.schema_version && plan.schema_version >= 2) {
          const { data: recipesData, error: recipesError } = await supabase
            .rpc('get_meal_plan_recipes', { plan_id: plan.id });
            
          if (recipesError) {
            console.error('Error fetching plan recipes:', recipesError);
            processedPlans.push({
              ...plan,
              plan_data: { 
                days: [], 
                description: getDescription(plan.plan_data)
              }
            });
            continue;
          }
          
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
            
            if (recipe_data && typeof recipe_data === 'object' && !Array.isArray(recipe_data)) {
              try {
                const dbRecipe = jsonToDbRecipe(recipe_data);
                const recipe = dbToFrontendRecipe(dbRecipe);
                
                if (meal_type === 'breakfast') {
                  day.meals.breakfast = recipe;
                } else if (meal_type === 'lunch') {
                  day.meals.lunch = recipe;
                } else if (meal_type === 'dinner') {
                  day.meals.dinner = recipe;
                } else if (meal_type === 'snacks') {
                  day.meals.snacks.push(recipe);
                }
              } catch (error) {
                console.error('Error processing recipe data:', error);
              }
            }
          });
          
          const daysArray = Array.from(dayMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([_, dayData]) => dayData);
            
          processedPlans.push({
            id: plan.id,
            name: plan.name,
            created_at: plan.created_at,
            schema_version: plan.schema_version,
            user_id: plan.user_id,
            plan_data: {
              days: daysArray,
              description: getDescription(plan.plan_data),
              tags: getTags(plan.plan_data)
            }
          });
        } else {
          let planData = { days: [], description: '', tags: [] };
          
          if (typeof plan.plan_data === 'string') {
            try {
              planData = JSON.parse(plan.plan_data);
            } catch (error) {
              console.error('Error parsing plan_data string:', error);
            }
          } else if (typeof plan.plan_data === 'object' && plan.plan_data !== null) {
            const rawPlanData = plan.plan_data as any;
            planData = {
              days: Array.isArray(rawPlanData.days) ? rawPlanData.days : [],
              description: typeof rawPlanData.description === 'string' ? rawPlanData.description : '',
              tags: Array.isArray(rawPlanData.tags) ? rawPlanData.tags : []
            };
          }
            
          processedPlans.push({
            id: plan.id,
            name: plan.name,
            created_at: plan.created_at,
            schema_version: plan.schema_version,
            user_id: plan.user_id,
            plan_data: planData
          });
        }
      }
      
      return processedPlans;
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your saved meal plans.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlan = async (id: string, activePlans: any[]): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to delete meal plans.",
          variant: "destructive"
        });
        return false;
      }

      console.log(`Attempting to delete plan with ID: ${id}`);
      
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
      
      if (existingPlan.user_id !== user.id) {
        console.error('User does not own this plan');
        toast({
          title: "Permission Denied",
          description: "You can only delete your own meal plans.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Deletion error:', error);
        throw error;
      }
      
      console.log('Plan deleted successfully from database');
      
      // Check if any active plans need to be removed
      const isActivePlanBeingDeleted = activePlans.some(ap => ap.plan.id === id);
      
      if (isActivePlanBeingDeleted) {
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

  const updatePlan = async (id: string, updates: { name?: string; description?: string }, plans: MealPlan[]) => {
    try {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;
      
      const updateData: any = {};
      
      if (updates.name) {
        updateData.name = updates.name;
      }
      
      if (updates.description !== undefined) {
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
      
      toast({
        title: "Success",
        description: "Meal plan updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to update the meal plan.",
        variant: "destructive"
      });
      return false;
    }
  };

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
      
      const planData = {
        name: plan.name,
        user_id: user.id,
        plan_data: {
          description: plan.description || '',
          days: []
        },
        schema_version: 2
      };
      
      let planId = plan.id;
      
      if (plan.id) {
        const { error: updateError } = await supabase
          .from('saved_meal_plans')
          .update(planData)
          .eq('id', plan.id)
          .eq('user_id', user.id);
          
        if (updateError) throw updateError;
      } else {
        const { data: newPlan, error: createError } = await supabase
          .from('saved_meal_plans')
          .insert(planData)
          .select('id')
          .single();
          
        if (createError) throw createError;
        planId = newPlan.id;
      }
      
      if (!planId) throw new Error('Failed to get plan ID after save');
      
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
  
  return {
    isLoading,
    fetchPlans,
    deletePlan,
    updatePlan,
    saveMealPlan
  };
};
