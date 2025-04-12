
import { format, parseISO, startOfDay, differenceInDays, isEqual, addDays } from 'date-fns';
import { ActiveMealPlan, MealPlan } from '@/types/mealPlanTypes';
import { Json } from '@/integrations/supabase/types';
import { DbRecipe } from '@/utils/recipeDbUtils';

export const getDescription = (planData: Json): string => {
  if (typeof planData === 'object' && planData !== null && !Array.isArray(planData)) {
    return (planData as {description?: string}).description || '';
  }
  return '';
};

export const getTags = (planData: Json): string[] => {
  if (typeof planData === 'object' && planData !== null && !Array.isArray(planData)) {
    const tags = (planData as {tags?: string[]}).tags;
    return Array.isArray(tags) ? tags : [];
  }
  return [];
};

export const jsonToDbRecipe = (data: any): DbRecipe => {
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

export const checkPlanOverlap = (
  plan: MealPlan, 
  startDate: string, 
  activePlans: ActiveMealPlan[]
): boolean => {
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

export const calculatePlanDates = (plan: MealPlan, startDay: number): {startDate: string, endDate: string} => {
  const today = new Date();
  const startDate = new Date();
  
  if (startDay > 0) {
    startDate.setDate(startDate.getDate() - startDay);
  } else if (startDay < 0) {
    startDate.setDate(startDate.getDate() + Math.abs(startDay));
  }
  
  const endDate = addDays(startDate, plan.plan_data.days.length - 1);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

export const getActivePlanForDate = (dateString: string, activePlans: ActiveMealPlan[]): ActiveMealPlan | null => {
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

export const getMealsForDate = (dateString: string, activePlans: ActiveMealPlan[]) => {
  if (activePlans.length === 0) {
    console.log('No active plans to get meals from');
    return null;
  }
  
  const targetDate = parseISO(dateString);
  
  for (const activePlan of activePlans) {
    const startDate = parseISO(activePlan.startDate);
    const endDate = parseISO(activePlan.endDate);
    
    if (targetDate >= startDate && targetDate <= endDate) {
      console.log('Found active plan for date:', dateString);
      
      const startDayStart = startOfDay(startDate);
      const targetDayStart = startOfDay(targetDate);
      
      const dayDiff = differenceInDays(targetDayStart, startDayStart);
      
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

export const dateHasActivePlan = (date: Date, activePlans: ActiveMealPlan[]): boolean => {
  const dateString = date.toISOString();
  return getActivePlanForDate(dateString, activePlans) !== null;
};

export const getDatesWithActivePlans = (activePlans: ActiveMealPlan[]): {[key: string]: string} => {
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
