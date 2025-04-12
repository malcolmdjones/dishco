import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { dbToFrontendRecipe, DbRecipe } from '@/utils/recipeDbUtils';
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
    const loadActivePlan = () => {
      const storedActivePlan = sessionStorage.getItem('activePlan');
      if (!storedActivePlan) return;
      
      try {
        const parsedPlan = JSON.parse(storedActivePlan);
        
        if (plans.length > 0) {
          const matchingPlan = plans.find(p => p.id === parsedPlan.planId);
          
          if (matchingPlan) {
            setActivePlan({ 
              plan: matchingPlan, 
              startDay: parsedPlan.startDay || 0 
            });
            return;
          }
        }
        
        setActivePlan({ 
          plan: { 
            id: parsedPlan.planId || 'active', 
            name: parsedPlan.name || 'Active Plan', 
            created_at: new Date().toISOString(),
            plan_data: {
              days: parsedPlan.days || [],
              description: parsedPlan.description || '',
              tags: parsedPlan.tags || []
            }
          },
          startDay: parsedPlan.startDay || 0
        });
      } catch (error) {
        console.error('Error parsing active meal plan:', error);
        sessionStorage.removeItem('activePlan');
      }
    };
    
    loadActivePlan();
  }, []);
  
  useEffect(() => {
    if (plans.length > 0 && activePlan && activePlan.plan.id !== 'active') {
      const storedActivePlan = sessionStorage.getItem('activePlan');
      if (!storedActivePlan) return;
      
      try {
        const parsedPlan = JSON.parse(storedActivePlan);
        const matchingPlan = plans.find(p => p.id === parsedPlan.planId);
        
        if (matchingPlan) {
          setActivePlan({ 
            plan: matchingPlan, 
            startDay: parsedPlan.startDay || 0 
          });
        }
      } catch (error) {
        console.error('Error updating active meal plan after plans loaded:', error);
      }
    }
  }, [plans]);

  const getDescription = (planData: Json): string => {
    if (typeof planData === 'object' && planData !== null && !Array.isArray(planData)) {
      return (planData as {description?: string}).description || '';
    }
    return '';
  };
  
  const getTags = (planData: Json): string[] => {
    if (typeof planData === 'object' && planData !== null && !Array.isArray(planData)) {
      const tags = (planData as {tags?: string[]}).tags;
      return Array.isArray(tags) ? tags : [];
    }
    return [];
  };

  const jsonToDbRecipe = (data: any): DbRecipe => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid recipe data provided');
    }

    return {
      id: data.id || '',
      title: data.title || null,
      short_description: data.short_description || null,
      type: data.type || null,
      meal_prep: data.meal_prep || null,
      prep_duration_days: data.prep_duration_days || null,
      servings: data.servings || null,
      prep_time: data.prep_time || null,
      cook_time: data.cook_time || null,
      total_time: data.total_time || null,
      price_range: data.price_range || null,
      calorie_bracket: data.calorie_bracket || null,
      nutrition_calories: data.nutrition_calories || null,
      nutrition_protein: data.nutrition_protein || null,
      nutrition_carbs: data.nutrition_carbs || null,
      nutrition_fat: data.nutrition_fat || null,
      ingredients_json: data.ingredients_json || null,
      instructions_json: data.instructions_json || null,
      tags: data.tags || null,
      protein_focus: data.protein_focus || null,
      cuisine: data.cuisine || null,
      dietary_tags: data.dietary_tags || null,
      upc_ingredients: data.upc_ingredients || null,
      image_url: data.image_url || null,
      created_by: data.created_by || null,
      is_public: data.is_public || null,
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
      oven: data.oven || null,
      stovetop: data.stovetop || null,
      air_fryer: data.air_fryer || null,
      blender: data.blender || null,
      grill: data.grill || null,
      slow_cooker: data.slow_cooker || null
    };
  };

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        setPlans([]);
        setIsLoading(false);
        return;
      }

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
          let planData: MealPlanData;
          
          if (typeof plan.plan_data === 'string') {
            try {
              planData = JSON.parse(plan.plan_data) as MealPlanData;
            } catch (error) {
              console.error('Error parsing plan_data string:', error);
              planData = { days: [], description: '', tags: [] };
            }
          } else if (typeof plan.plan_data === 'object' && plan.plan_data !== null) {
            const rawPlanData = plan.plan_data as any;
            planData = {
              days: Array.isArray(rawPlanData.days) ? rawPlanData.days : [],
              description: typeof rawPlanData.description === 'string' ? rawPlanData.description : '',
              tags: Array.isArray(rawPlanData.tags) ? rawPlanData.tags : []
            };
          } else {
            planData = { days: [], description: '', tags: [] };
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

  const deletePlan = async (id: string) => {
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
      
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));
      
      if (selectedPlan?.id === id) {
        setSelectedPlan(null);
        setIsPlanDetailOpen(false);
      }
      
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

  const updatePlan = async (id: string, updates: { name?: string; description?: string }) => {
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
    const planToStore = {
      planId: plan.id,
      name: plan.name,
      startDay: startDay,
      days: plan.plan_data.days,
      description: plan.plan_data.description,
      tags: plan.plan_data.tags
    };
    
    sessionStorage.setItem('activePlan', JSON.stringify(planToStore));
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
    if (!activePlan || !activePlan.plan.plan_data.days || activePlan.plan.plan_data.days.length === 0) {
      return null;
    }
    
    const targetDate = new Date(dateString);
    const startDate = new Date();
    
    if (activePlan.startDay > 0) {
      startDate.setDate(startDate.getDate() - activePlan.startDay);
    } else if (activePlan.startDay < 0) {
      startDate.setDate(startDate.getDate() + Math.abs(activePlan.startDay));
    }
    
    startDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('Target date:', dateString);
    console.log('Start date:', format(startDate, 'yyyy-MM-dd'));
    console.log('Day difference:', dayDiff);
    
    if (dayDiff >= 0 && dayDiff < activePlan.plan.plan_data.days.length) {
      console.log(`Found meals for day ${dayDiff}:`, activePlan.plan.plan_data.days[dayDiff].meals);
      return activePlan.plan.plan_data.days[dayDiff].meals;
    }
    
    console.log('No meals found for this date');
    return null;
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  return {
    plans,
    isLoading,
    selectedPlan,
    setSelectedPlan,
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
