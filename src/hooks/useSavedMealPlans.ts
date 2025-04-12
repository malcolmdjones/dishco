
import { useState, useEffect } from 'react';
import { format, parseISO, startOfDay, differenceInDays, isEqual, addDays } from 'date-fns';
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

export type ActiveMealPlan = {
  plan: MealPlan;
  startDay: number;
  startDate: string; // ISO string date when the plan starts
  endDate: string;   // ISO string date when the plan ends
};

export const useSavedMealPlans = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isPlanDetailOpen, setIsPlanDetailOpen] = useState(false);
  const [activePlans, setActivePlans] = useState<ActiveMealPlan[]>([]);
  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  const [pendingActivation, setPendingActivation] = useState<{plan: MealPlan, startDay: number, startDate: string} | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadActivePlans = () => {
      const storedActivePlans = sessionStorage.getItem('activePlans');
      if (!storedActivePlans) return;
      
      try {
        const parsedPlans = JSON.parse(storedActivePlans) as ActiveMealPlan[];
        
        if (plans.length > 0) {
          const updatedActivePlans: ActiveMealPlan[] = [];
          
          for (const activePlan of parsedPlans) {
            const matchingPlan = plans.find(p => p.id === activePlan.plan.id);
            
            if (matchingPlan) {
              updatedActivePlans.push({
                plan: matchingPlan,
                startDay: activePlan.startDay,
                startDate: activePlan.startDate,
                endDate: activePlan.endDate
              });
            } else {
              updatedActivePlans.push(activePlan);
            }
          }
          
          setActivePlans(updatedActivePlans);
        } else {
          setActivePlans(parsedPlans);
        }
      } catch (error) {
        console.error('Error parsing active meal plans:', error);
        sessionStorage.removeItem('activePlans');
      }
    };
    
    loadActivePlans();
  }, []);
  
  useEffect(() => {
    if (plans.length > 0) {
      const storedActivePlans = sessionStorage.getItem('activePlans');
      if (!storedActivePlans) return;
      
      try {
        const parsedPlans = JSON.parse(storedActivePlans) as ActiveMealPlan[];
        const updatedActivePlans: ActiveMealPlan[] = [];
        
        for (const activePlan of parsedPlans) {
          const matchingPlan = plans.find(p => p.id === activePlan.plan.id);
          
          if (matchingPlan) {
            updatedActivePlans.push({
              plan: matchingPlan,
              startDay: activePlan.startDay,
              startDate: activePlan.startDate,
              endDate: activePlan.endDate
            });
          } else {
            updatedActivePlans.push(activePlan);
          }
        }
        
        setActivePlans(updatedActivePlans);
      } catch (error) {
        console.error('Error updating active meal plans after plans loaded:', error);
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
      
      // Check if any active plans need to be removed
      const updatedActivePlans = activePlans.filter(ap => ap.plan.id !== id);
      if (updatedActivePlans.length !== activePlans.length) {
        setActivePlans(updatedActivePlans);
        if (updatedActivePlans.length === 0) {
          sessionStorage.removeItem('activePlans');
        } else {
          sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
        }
        
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

  const checkPlanOverlap = (plan: MealPlan, startDate: string): boolean => {
    if (activePlans.length === 0) return false;
    
    const planStartDate = new Date(startDate);
    const planDuration = plan.plan_data.days.length;
    const planEndDate = addDays(planStartDate, planDuration - 1);
    
    for (const activePlan of activePlans) {
      const activeStartDate = new Date(activePlan.startDate);
      const activeEndDate = new Date(activePlan.endDate);
      
      if (
        (planStartDate <= activeEndDate && planStartDate >= activeStartDate) ||
        (planEndDate <= activeEndDate && planEndDate >= activeStartDate) ||
        (planStartDate <= activeStartDate && planEndDate >= activeEndDate)
      ) {
        return true;
      }
    }
    
    return false;
  };

  const getActivePlanForDate = (dateString: string): ActiveMealPlan | null => {
    const targetDate = parseISO(dateString);
    
    for (const activePlan of activePlans) {
      const startDate = parseISO(activePlan.startDate);
      const endDate = parseISO(activePlan.endDate);
      
      if (targetDate >= startDate && targetDate <= endDate) {
        return activePlan;
      }
    }
    
    return null;
  };

  const calculatePlanDates = (plan: MealPlan, startDay: number): {startDate: string, endDate: string} => {
    const today = new Date();
    const startDate = new Date();
    
    // Important: Set hours, minutes, seconds to zero for consistent date comparison
    startDate.setHours(0, 0, 0, 0);
    
    if (startDay > 0) {
      // If startDay is positive, we're looking at previous days (e.g., yesterday = 1)
      startDate.setDate(startDate.getDate() - startDay);
    } else if (startDay < 0) {
      // If startDay is negative, we're looking at future days (e.g., tomorrow = -1)
      startDate.setDate(startDate.getDate() + Math.abs(startDay));
    }
    
    const endDate = addDays(startDate, plan.plan_data.days.length - 1);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  const activatePlan = (plan: MealPlan, startDay: number = 0, force: boolean = false) => {
    // Fix the date handling for the start date
    const { startDate, endDate } = calculatePlanDates(plan, startDay);
    
    if (!force && checkPlanOverlap(plan, startDate)) {
      setPendingActivation({ plan, startDay, startDate });
      setShowOverlapWarning(true);
      return false;
    }
    
    const newActivePlan: ActiveMealPlan = {
      plan,
      startDay,
      startDate,
      endDate
    };
    
    // Include today's date in the plan by ensuring startDay is 0 when selecting today
    console.log(`Activating plan from ${startDate} to ${endDate} with startDay ${startDay}`);
    
    const updatedActivePlans = [...activePlans, newActivePlan];
    setActivePlans(updatedActivePlans);
    
    // Save to session storage
    sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
    
    toast({
      title: "Plan Activated",
      description: `${plan.name} is now active from ${format(parseISO(startDate), 'MMM d')} to ${format(parseISO(endDate), 'MMM d')}.`,
    });
    
    return true;
  };

  const forceActivatePlan = () => {
    if (!pendingActivation) {
      console.error("No pending activation found when trying to force activate");
      return false;
    }
    
    try {
      console.log("Force activating plan:", pendingActivation.plan.name);
      
      const { plan, startDay, startDate } = pendingActivation;
      const { endDate } = calculatePlanDates(plan, startDay);
      
      console.log(`Activating plan from ${startDate} to ${endDate}`);
      console.log(`Current active plans:`, activePlans);
      
      const updatedActivePlans = activePlans.filter(activePlan => {
        const activeStartDate = new Date(activePlan.startDate);
        const activeEndDate = new Date(activePlan.endDate);
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);
        
        const hasOverlap = (
          (newStartDate <= activeEndDate && newStartDate >= activeStartDate) ||
          (newEndDate <= activeEndDate && newEndDate >= activeStartDate) ||
          (newStartDate <= activeStartDate && newEndDate >= activeEndDate)
        );
        
        if (hasOverlap) {
          console.log(`Removing overlapping plan: ${activePlan.plan.name} (${activePlan.startDate} - ${activePlan.endDate})`);
        }
        return !hasOverlap;
      });
      
      const newActivePlan: ActiveMealPlan = {
        plan,
        startDay,
        startDate,
        endDate
      };
      
      updatedActivePlans.push(newActivePlan);
      console.log("Updated active plans:", updatedActivePlans);
      
      setActivePlans(updatedActivePlans);
      sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
      
      setPendingActivation(null);
      setShowOverlapWarning(false);
      
      toast({
        title: "Plan Activated",
        description: `${plan.name} is now active from ${format(parseISO(startDate), 'MMM d')} to ${format(parseISO(endDate), 'MMM d')}.`,
      });
      
      console.log("Plan successfully activated");
      return true;
    } catch (error) {
      console.error("Error in forceActivatePlan:", error);
      setPendingActivation(null);
      setShowOverlapWarning(false);
      return false;
    }
  };

  const cancelActivation = () => {
    setPendingActivation(null);
    setShowOverlapWarning(false);
  };

  const deactivatePlan = (planId: string) => {
    const updatedActivePlans = activePlans.filter(ap => ap.plan.id !== planId);
    setActivePlans(updatedActivePlans);
    
    if (updatedActivePlans.length === 0) {
      sessionStorage.removeItem('activePlans');
    } else {
      sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
    }
    
    toast({
      title: "Plan Deactivated",
      description: "The meal plan has been deactivated.",
    });
  };

  const deactivateAllPlans = () => {
    setActivePlans([]);
    sessionStorage.removeItem('activePlans');
    
    toast({
      title: "All Plans Deactivated",
      description: "You no longer have any active meal plans.",
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
    if (activePlans.length === 0) {
      console.log('No active plans to get meals from');
      return null;
    }
    
    const targetDate = parseISO(dateString);
    
    for (const activePlan of activePlans) {
      const startDate = parseISO(activePlan.startDate);
      const endDate = parseISO(activePlan.endDate);
      
      // Normalize dates to start of day for consistent comparison
      const startDayStart = startOfDay(startDate);
      const targetDayStart = startOfDay(targetDate);
      const endDayStart = startOfDay(endDate);
      
      if (targetDayStart >= startDayStart && targetDayStart <= endDayStart) {
        console.log('Found active plan for date:', dateString);
        
        const dayDiff = differenceInDays(targetDayStart, startDayStart);
        
        console.log('Day difference:', dayDiff);
        console.log('Plan days length:', activePlan.plan.plan_data.days.length);
        
        if (dayDiff >= 0 && dayDiff < activePlan.plan.plan_data.days.length) {
          console.log(`Found meals for day ${dayDiff}:`, activePlan.plan.plan_data.days[dayDiff].meals);
          
          const storedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
          const loggedMealsForDate = storedMeals.filter(meal => {
            if (!meal.loggedAt) return false;
            const mealDate = startOfDay(parseISO(meal.loggedAt));
            return isEqual(mealDate, targetDayStart);
          });
          
          if (loggedMealsForDate.length > 0) {
            console.log('Found manually logged meals for this date, prioritizing them');
          }
          
          return activePlan.plan.plan_data.days[dayDiff].meals;
        }
      }
    }
    
    console.log('No meals found for this date');
    return null;
  };

  const dateHasActivePlan = (date: Date): boolean => {
    const dateString = date.toISOString();
    return getActivePlanForDate(dateString) !== null;
  };

  const getDatesWithActivePlans = (): {[key: string]: string} => {
    const result: {[key: string]: string} = {};
    
    activePlans.forEach(activePlan => {
      const startDate = parseISO(activePlan.startDate);
      const endDate = parseISO(activePlan.endDate);
      let currentDate = startDate;
      
      while (currentDate <= endDate) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        result[dateKey] = activePlan.plan.name;
        currentDate = addDays(currentDate, 1);
      }
    });
    
    return result;
  };

  const deactivatePlanForDate = (dateString: string): boolean => {
    console.log(`Attempting to deactivate plan for date: ${dateString}`);
    
    const activeDatesMap = getDatesWithActivePlans();
    const dateHasPlan = activeDatesMap[dateString];
    if (!dateHasPlan) {
      console.log("No plan found for this date");
      return false;
    }

    const updatedActivePlans = activePlans.filter(activePlan => {
      const startDate = parseISO(activePlan.startDate);
      const endDate = parseISO(activePlan.endDate);
      const targetDate = parseISO(dateString);
      
      if (targetDate >= startDate && targetDate <= endDate) {
        console.log(`Found plan ${activePlan.plan.name} that includes this date`);
        
        const daysBeforeTarget = differenceInDays(targetDate, startDate);
        const daysAfterTarget = differenceInDays(endDate, targetDate);
        
        if (daysBeforeTarget === 0 && daysAfterTarget === 0) {
          console.log("Plan only covers this date, removing entire plan");
          return false;
        }
        
        console.log("Removing entire plan that includes this date");
        return false;
      }
      
      return true;
    });
    
    if (updatedActivePlans.length !== activePlans.length) {
      setActivePlans(updatedActivePlans);
      
      if (updatedActivePlans.length === 0) {
        sessionStorage.removeItem('activePlans');
      } else {
        sessionStorage.setItem('activePlans', JSON.stringify(updatedActivePlans));
      }
      
      return true;
    }
    
    return false;
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
    activePlans,
    showOverlapWarning,
    setShowOverlapWarning,
    pendingActivation,
    setPendingActivation,
    fetchPlans,
    deletePlan,
    updatePlan,
    viewPlanDetails,
    activatePlan,
    forceActivatePlan,
    cancelActivation,
    deactivatePlan,
    deactivateAllPlans,
    deactivatePlanForDate,
    copyAndEditPlan,
    getMealsForDate,
    dateHasActivePlan,
    getDatesWithActivePlans,
    getActivePlanForDate,
    saveMealPlan
  };
};
